// src/services/OpenRouterService.ts
export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  topic: string;
  messages: ChatMessage[];
  difficulty: '初级' | '中级' | '高级';
  language: 'zh-CN' | 'en-US';
}

export class OpenRouterService {
  private config: OpenRouterConfig;
  private conversationContext: ConversationContext;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    // 安全地获取环境变量
    const getEnvVar = (key: string): string => {
      try {
        return (import.meta as { env?: Record<string, string> }).env?.[key] || '';
      } catch {
        return '';
      }
    };    this.config = {
      apiKey: config.apiKey || getEnvVar('VITE_OPENROUTER_API_KEY'),
      model: config.model || 'qwen/qwen2.5-vl-32b-instruct:free',
      maxTokens: config.maxTokens || 500,
      temperature: config.temperature || 0.7,
      ...config
    };

    this.conversationContext = {
      topic: '',
      messages: [],
      difficulty: '中级',
      language: 'zh-CN'
    };
  }

  /**
   * 设置对话上下文
   */
  setConversationContext(context: Partial<ConversationContext>): void {
    this.conversationContext = {
      ...this.conversationContext,
      ...context
    };

    // 如果设置了新主题，重置对话历史并添加系统提示
    if (context.topic) {
      this.conversationContext.messages = [
        {
          role: 'system',
          content: this.generateSystemPrompt()
        }
      ];
    }
  }

  /**
   * 生成系统提示
   */
  private generateSystemPrompt(): string {
    const { topic, difficulty, language } = this.conversationContext;
    
    let prompt = '';
    
    if (language === 'en-US') {
      prompt = `You are a helpful English conversation partner. We are discussing the topic: "${topic}". `;
      
      switch (difficulty) {
        case '初级':
          prompt += 'Please use simple vocabulary and short sentences. Be encouraging and patient. Ask follow-up questions to keep the conversation going.';
          break;
        case '中级':
          prompt += 'Use moderate vocabulary and varied sentence structures. Provide helpful corrections when needed. Ask thoughtful questions.';
          break;
        case '高级':
          prompt += 'Use advanced vocabulary and complex sentence structures. Challenge the speaker with deeper questions and nuanced discussions.';
          break;
      }
    } else {
      prompt = `你是一个有用的中文对话伙伴。我们正在讨论主题："${topic}"。`;
      
      switch (difficulty) {
        case '初级':
          prompt += '请使用简单的词汇和短句。要鼓励和耐心。提出后续问题以保持对话进行。';
          break;
        case '中级':
          prompt += '使用中等词汇和多样的句子结构。在需要时提供有用的纠正。提出有思考性的问题。';
          break;
        case '高级':
          prompt += '使用高级词汇和复杂的句子结构。用更深层的问题和细致的讨论来挑战说话者。';
          break;
      }
    }
    
    return prompt;
  }

  /**
   * 生成AI回复
   */
  async generateResponse(userMessage: string): Promise<string> {
    try {
      // 添加用户消息到上下文
      this.conversationContext.messages.push({
        role: 'user',
        content: userMessage
      });

      // 如果没有API密钥，使用备用回复
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        console.log('No OpenRouter API key configured, using fallback responses');
        const fallbackResponse = this.generateContextualFallbackResponse(userMessage);
        
        this.conversationContext.messages.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return fallbackResponse;
      }

      // 构建消息数组（OpenRouter使用标准的OpenAI格式）
      const messages = this.conversationContext.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));      console.log('Sending request to OpenRouter:', {
        model: this.config.model,
        messageCount: messages.length
      });

      // 创建一个带超时的 fetch 请求（30秒超时）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DeepTalk'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('OpenRouter response:', data);

      // 提取AI回复
      let aiResponse = '';
      if (data.choices && data.choices.length > 0) {
        aiResponse = data.choices[0].message?.content?.trim() || '';
      }

      if (!aiResponse) {
        throw new Error('Empty response from OpenRouter API');
      }

      // 添加AI回复到上下文
      this.conversationContext.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // 保持对话历史在合理长度内（最多20条消息）
      if (this.conversationContext.messages.length > 21) { // 1条系统消息 + 20条对话
        this.conversationContext.messages = [
          this.conversationContext.messages[0], // 保留系统消息
          ...this.conversationContext.messages.slice(-20) // 保留最后20条消息
        ];
      }

      return aiResponse;    } catch (error) {
      // 详细的错误日志
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ OpenRouter API 请求超时（30秒）');
        } else {
          console.error('❌ OpenRouter API 错误:', error.message, error);
        }
      } else {
        console.error('❌ OpenRouter API 未知错误:', error);
      }
      
      // 返回备用回复
      const fallbackResponse = this.generateContextualFallbackResponse(userMessage);
      console.warn('⚠️ 使用备用回复:', fallbackResponse);
      
      // 添加到上下文（避免重复添加用户消息）
      this.conversationContext.messages.push({
        role: 'assistant',
        content: fallbackResponse
      });
      
      return fallbackResponse;
    }
  }

  /**
   * 生成上下文相关的备用回复
   */
  private generateContextualFallbackResponse(userMessage: string): string {
    const { language, difficulty } = this.conversationContext;
    const message = userMessage.toLowerCase();
    
    const contextualResponses = [];
    
    if (language === 'en-US') {
      // 英语回复
      if (message.includes('think') || message.includes('believe')) {
        contextualResponses.push("That's an interesting perspective. What led you to that conclusion?");
        contextualResponses.push("I can see why you think that way. Have you always held this view?");
      }
      
      if (message.includes('like') || message.includes('enjoy')) {
        contextualResponses.push("That sounds great! What do you like most about it?");
        contextualResponses.push("I'm glad you enjoy that. How did you first get interested in it?");
      }
      
      if (message.includes('problem') || message.includes('difficult')) {
        contextualResponses.push("That does sound challenging. How are you dealing with it?");
        contextualResponses.push("I understand it's not easy. What strategies have you tried?");
      }
      
      // 根据难度级别调整回复
      if (difficulty === '初级') {
        contextualResponses.push("That's good! Can you tell me more?");
        contextualResponses.push("I see. What do you think about it?");
      } else if (difficulty === '高级') {
        contextualResponses.push("That's a sophisticated viewpoint. How do you reconcile different perspectives?");
        contextualResponses.push("Your insight is quite profound. What implications do you see?");
      }
      
      // 默认回复
      if (contextualResponses.length === 0) {
        contextualResponses.push("That's very interesting. Could you elaborate on that?");
        contextualResponses.push("I understand. What's your take on this situation?");
      }
    } else {
      // 中文回复
      if (message.includes('觉得') || message.includes('认为') || message.includes('想')) {
        contextualResponses.push("这是一个很有意思的想法。你是怎么得出这个结论的？");
        contextualResponses.push("我能理解你的观点。你一直都是这样想的吗？");
      }
      
      if (message.includes('喜欢') || message.includes('享受') || message.includes('爱')) {
        contextualResponses.push("听起来很棒！你最喜欢它的哪个方面？");
        contextualResponses.push("很高兴你喜欢这个。你是怎么开始对它感兴趣的？");
      }
      
      if (message.includes('问题') || message.includes('困难') || message.includes('麻烦')) {
        contextualResponses.push("这听起来确实有挑战性。你打算怎么处理呢？");
        contextualResponses.push("我理解这不容易。你尝试过什么方法吗？");
      }
      
      // 根据难度级别调整回复
      if (difficulty === '初级') {
        contextualResponses.push("很好！你能多说一些吗？");
        contextualResponses.push("我明白了。你觉得怎么样？");
      } else if (difficulty === '高级') {
        contextualResponses.push("这是一个很有深度的观点。你如何看待不同角度的看法？");
        contextualResponses.push("你的见解很深刻。你认为这对更广泛的背景有什么影响？");
      }
      
      // 默认中文回复
      if (contextualResponses.length === 0) {
        contextualResponses.push("这很有趣。你能详细说说吗？");
        contextualResponses.push("我明白了。你对这种情况有什么看法？");
        contextualResponses.push("谢谢分享。你觉得最重要的方面是什么？");
      }
    }
    
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  }

  /**
   * 清除对话历史
   */
  clearConversationHistory(): void {
    this.conversationContext.messages = [
      {
        role: 'system',
        content: this.generateSystemPrompt()
      }
    ];
  }

  /**
   * 获取对话历史
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationContext.messages];
  }

  /**
   * 检查API密钥是否已配置
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.trim() !== '';
  }

  /**
   * 获取当前配置
   */
  getConfig(): OpenRouterConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<OpenRouterConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
}
