// src/services/GeminiService.ts
export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
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

export class GeminiService {
  private config: GeminiConfig;
  private conversationContext: ConversationContext;
  constructor(config: Partial<GeminiConfig> = {}) {
    // 安全地获取环境变量
    const getEnvVar = (key: string): string => {
      try {
        return (import.meta as { env?: Record<string, string> }).env?.[key] || '';
      } catch {
        return '';
      }
    };

    // 从环境变量或配置参数获取API密钥，不使用硬编码默认值
    const apiKey = config.apiKey || getEnvVar('VITE_GEMINI_API_KEY');
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API密钥未配置，请在.env.local中设置VITE_GEMINI_API_KEY');
    }

    this.config = {
      apiKey: apiKey,
      model: config.model || 'gemini-2.5-flash',
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
      });      // 如果没有API密钥，使用备用回复
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        console.log('No Gemini API key configured, using fallback responses');
        const fallbackResponse = this.generateContextualFallbackResponse();
        
        this.conversationContext.messages.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return fallbackResponse;
      }

      // 构建Gemini API的完整提示（包含系统消息和历史）
      const systemMessage = this.conversationContext.messages.find(m => m.role === 'system');
      const conversationHistory = this.conversationContext.messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
        .join('\n');
      
      const fullPrompt = systemMessage
        ? `${systemMessage.content}\n\n对话历史：\n${conversationHistory}\n\n请根据上述对话历史回复用户的最后一条消息。`
        : conversationHistory;

      console.log('Sending request to Gemini:', {
        model: this.config.model,
        promptLength: fullPrompt.length
      });

      // 构建Gemini API请求体
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      };

      // 创建一个带超时的 fetch 请求（30秒超时）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://zjxx.lol/v1beta/models/${this.config.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'x-goog-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini:', data);

      // 解析Gemini响应
      let aiResponse = '';
      if (data.candidates && data.candidates.length > 0) {
        const firstCandidate = data.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
          aiResponse = firstCandidate.content.parts[0].text || '';
        }
      }

      if (!aiResponse) {
        console.error('Invalid Gemini response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }

      // 添加AI回复到上下文
      this.conversationContext.messages.push({
        role: 'assistant',
        content: aiResponse
      });      return aiResponse;    } catch (error: unknown) {
      console.error('Error generating AI response:', error);
      
      // 超时或网络错误时使用备用回复
      const fallbackResponse = this.generateContextualFallbackResponse();
      
      this.conversationContext.messages.push({
        role: 'assistant',
        content: fallbackResponse
      });
      
      return fallbackResponse;
    }
  }  /**
   * 生成上下文相关的备用回复
   */
  private generateContextualFallbackResponse(): string {
    const { topic, language } = this.conversationContext;
    
    const fallbacks = language === 'en-US' 
      ? [
          `That's an interesting point about ${topic}. Can you tell me more?`,
          `I appreciate your thoughts on ${topic}. What do you think about...?`,
          `Thank you for sharing. Could you explain that in a different way?`,
          `That's a good perspective. How does that relate to your experience?`,
          `I understand. What made you interested in ${topic}?`
        ]
      : [
          `关于${topic}，这是一个有趣的观点。能详细说说吗？`,
          `感谢你分享关于${topic}的想法。你认为...怎么样？`,
          `谢谢分享。能用另一种方式解释一下吗？`,
          `这是一个很好的角度。这与你的经历有什么关系？`,
          `我理解了。是什么让你对${topic}感兴趣的？`
        ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * 清除对话历史
   */
  clearConversation(): void {
    const systemMessage = this.conversationContext.messages.find(m => m.role === 'system');
    this.conversationContext.messages = systemMessage ? [systemMessage] : [];
  }

  /**
   * 获取对话历史
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationContext.messages];
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GeminiConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
}
