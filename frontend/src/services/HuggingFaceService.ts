// src/services/HuggingFaceService.ts
export interface HuggingFaceConfig {
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

export class HuggingFaceService {
  private config: HuggingFaceConfig;
  private conversationContext: ConversationContext;  constructor(config: Partial<HuggingFaceConfig> = {}) {
    // 安全地获取环境变量
    const getEnvVar = (key: string): string => {
      try {
        return (import.meta as { env?: Record<string, string> }).env?.[key] || '';
      } catch {
        return '';
      }
    };

    this.config = {
      apiKey: config.apiKey || getEnvVar('VITE_HUGGINGFACE_API_KEY'),
      model: config.model || 'microsoft/DialoGPT-large',
      maxTokens: config.maxTokens || 150,
      temperature: config.temperature || 0.7,
      ...config
    };

    this.conversationContext = {
      topic: '',
      messages: [],
      difficulty: '中级',
      language: 'en-US'
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

      // 如果没有API密钥，直接使用备用回复
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        console.log('No API key configured, using fallback responses');
        const fallbackResponse = this.generateContextualFallbackResponse(userMessage);
        
        // 添加AI回复到上下文
        this.conversationContext.messages.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return fallbackResponse;
      }

      // 构建对话历史字符串
      const conversationHistory = this.buildConversationHistory();

      console.log('Sending request to Hugging Face:', {
        model: this.config.model,
        input: conversationHistory
      });

      const response = await fetch(`https://api-inference.huggingface.co/models/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: conversationHistory,
          parameters: {
            max_new_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            do_sample: true,
            return_full_text: false
          },
          options: {
            wait_for_model: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Hugging Face response:', data);

      let aiResponse = '';
      
      if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === 'string') {
          aiResponse = data[0].trim();
        } else if (data[0].generated_text) {
          aiResponse = data[0].generated_text.trim();
        }
      } else if (data.generated_text) {
        aiResponse = data.generated_text.trim();
      }

      // 清理回复文本
      aiResponse = this.cleanResponse(aiResponse, userMessage);

      if (!aiResponse) {
        throw new Error('Empty response from Hugging Face API');
      }

      // 添加AI回复到上下文
      this.conversationContext.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // 保持对话历史在合理长度内（最多10条消息）
      if (this.conversationContext.messages.length > 11) { // 1条系统消息 + 10条对话
        this.conversationContext.messages = [
          this.conversationContext.messages[0], // 保留系统消息
          ...this.conversationContext.messages.slice(-10) // 保留最后10条消息
        ];
      }

      return aiResponse;

    } catch (error) {
      console.error('Hugging Face API error:', error);
      
      // 返回备用回复
      const fallbackResponses = this.getFallbackResponses();
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return randomFallback;
    }
  }

  /**
   * 构建对话历史
   */
  private buildConversationHistory(): string {
    const { messages } = this.conversationContext;
    
    // 获取最近的对话（不包括系统消息）
    const recentMessages = messages.slice(1, -1); // 去掉系统消息和最后一条用户消息
    const lastUserMessage = messages[messages.length - 1];
    
    let conversation = '';
    
    // 添加最近的对话历史
    recentMessages.forEach(msg => {
      if (msg.role === 'user') {
        conversation += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversation += `Assistant: ${msg.content}\n`;
      }
    });
    
    // 添加当前用户消息
    conversation += `Human: ${lastUserMessage.content}\nAssistant:`;
    
    return conversation;
  }

  /**
   * 清理AI回复
   */
  private cleanResponse(response: string, userMessage: string): string {
    // 移除可能的重复用户输入
    response = response.replace(userMessage, '').trim();
    
    // 移除常见的前缀
    response = response.replace(/^(Human:|Assistant:|AI:|Bot:)/i, '').trim();
    
    // 移除多余的换行符
    response = response.replace(/\n+/g, ' ').trim();
    
    // 截取第一个完整的句子（如果回复太长）
    const sentences = response.match(/[^.!?]*[.!?]/g);
    if (sentences && sentences.length > 0) {
      // 如果第一句话太短，可以包含第二句话
      let result = sentences[0].trim();
      if (result.length < 20 && sentences.length > 1) {
        result += ' ' + sentences[1].trim();
      }
      return result;
    }
    
    // 如果没有找到完整句子，返回前100个字符
    return response.substring(0, 100).trim();
  }
  /**
   * 生成上下文相关的备用回复
   */
  private generateContextualFallbackResponse(userMessage: string): string {
    const { language, difficulty } = this.conversationContext;
    const message = userMessage.toLowerCase();
    
    // 根据用户消息内容生成更相关的回复
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
      
      if (message.includes('travel') || message.includes('vacation')) {
        contextualResponses.push("Travel can be so enriching! Where would you like to go next?");
        contextualResponses.push("That sounds like an amazing experience. What was the highlight?");
      }
      
      // 根据难度级别调整回复复杂度
      if (difficulty === '初级') {
        contextualResponses.push("That's good! Can you tell me more?");
        contextualResponses.push("I see. What do you think about it?");
        contextualResponses.push("Very nice! Do you like it?");
      } else if (difficulty === '高级') {
        contextualResponses.push("That's a sophisticated viewpoint. How do you reconcile different perspectives on this matter?");
        contextualResponses.push("Your insight is quite profound. What implications do you see for the broader context?");
      }
      
      // 默认回复
      if (contextualResponses.length === 0) {
        contextualResponses.push("That's very interesting. Could you elaborate on that?");
        contextualResponses.push("I understand. What's your take on this situation?");
        contextualResponses.push("Thank you for sharing. What do you think is the most important aspect?");
      }
    } else {
      // 中文回复
      if (message.includes('觉得') || message.includes('认为')) {
        contextualResponses.push("这是一个很有意思的想法。你是怎么得出这个结论的？");
        contextualResponses.push("我能理解你的观点。你一直都是这样想的吗？");
      }
      
      if (message.includes('喜欢') || message.includes('享受')) {
        contextualResponses.push("听起来很棒！你最喜欢它的哪个方面？");
        contextualResponses.push("很高兴你喜欢这个。你是怎么开始对它感兴趣的？");
      }
      
      // 默认中文回复
      if (contextualResponses.length === 0) {
        contextualResponses.push("这很有趣。你能详细说说吗？");
        contextualResponses.push("我明白了。你对这种情况有什么看法？");
        contextualResponses.push("谢谢分享。你觉得最重要的方面是什么？");
      }
    }
    
    // 随机选择一个回复
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  }

  /**
   * 获取备用回复
   */
  private getFallbackResponses(): string[] {
    const { language } = this.conversationContext;
    
    if (language === 'en-US') {
      return [
        "That's an interesting point. Could you tell me more about it?",
        "I understand. What do you think about the other aspects of this topic?",
        "That's a good perspective. How do you usually approach this situation?",
        "Thanks for sharing. What experiences have you had with this?",
        "I see. What would you recommend to someone facing a similar situation?"
      ];
    } else {
      return [
        "这是一个有趣的观点。你能告诉我更多吗？",
        "我明白了。你对这个话题的其他方面有什么看法？",
        "这是一个很好的观点。你通常如何处理这种情况？",
        "谢谢分享。你在这方面有什么经验？",
        "我明白了。你会建议面临类似情况的人怎么做？"
      ];
    }
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
    return !!this.config.apiKey;
  }
}
