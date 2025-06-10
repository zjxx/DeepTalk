import { describe, it, expect, beforeEach } from 'vitest'
import { VersusModel, type TranscriptMessage, } from '../VersusModel'

describe('VersusModel', () => {
  let versusModel: VersusModel

  beforeEach(() => {
    versusModel = new VersusModel()
  })

  describe('构造函数和初始状态', () => {
    it('应该正确初始化状态', () => {
      const state = versusModel.getState()
      
      expect(state.canvasWidth).toBe(0)
      expect(state.canvasHeight).toBe(0)
      expect(state.matchStarted).toBe(true)
      expect(state.remainingTime).toBe(300)
      expect(state.matchType).toBe('真人对战')
      expect(state.difficultyLevel).toBe('中级')
      expect(state.userMuted).toBe(false)
      expect(state.isUserSpeaking).toBe(false)
      expect(state.isPartnerSpeaking).toBe(false)
      expect(state.isPartnerThinking).toBe(false)
      expect(state.isRecording).toBe(false)
      expect(state.audioLevel).toBe(0)
      expect(state.lastRecordedAudio).toBe(null)
      expect(state.isPlayingAudio).toBe(false)
      expect(state.fullRecordingAvailable).toBe(false)
      expect(state.fullRecordingDuration).toBe(0)
      expect(state.playbackProgress).toBe(0)
      expect(state.currentPlaybackTime).toBe(0)
      expect(state.speakingTurn).toBe('user')
      expect(state.currentTopicIndex).toBe(0)
      expect(state.currentPromptIndex).toBe(0)
      expect(state.transcriptMessages).toEqual([])
    })

    it('应该返回状态的深拷贝', () => {
      const state1 = versusModel.getState()
      const state2 = versusModel.getState()
      
      expect(state1).not.toBe(state2) // 不是同一个对象
      expect(state1).toEqual(state2) // 但内容相同
    })
  })

  describe('canUserSpeak getter', () => {
    it('当发言权为用户时应该返回true', () => {
      versusModel.updateMatchState({ speakingTurn: 'user' })
      expect(versusModel.canUserSpeak).toBe(true)
    })

    it('当发言权为伙伴时应该返回false', () => {
      versusModel.updateMatchState({ speakingTurn: 'partner' })
      expect(versusModel.canUserSpeak).toBe(false)
    })
  })

  describe('currentTopic getter', () => {
    it('应该返回正确的主题文本', () => {
      const topic = versusModel.currentTopic
      expect(typeof topic).toBe('string')
      expect(topic.length).toBeGreaterThan(0)
    })

    it('应该根据currentTopicIndex返回不同的主题', () => {
      const topic1 = versusModel.currentTopic
      versusModel.updateMatchState({ currentTopicIndex: 1 })
      const topic2 = versusModel.currentTopic
      
      expect(topic1).not.toBe(topic2)
    })
  })

  describe('currentPrompt getter', () => {
    it('应该返回正确的提示文本', () => {
      const prompt = versusModel.currentPrompt
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(0)
    })

    it('应该根据currentPromptIndex返回不同的提示', () => {
      const prompt1 = versusModel.currentPrompt
      versusModel.updateMatchState({ currentPromptIndex: 1 })
      const prompt2 = versusModel.currentPrompt
      
      expect(prompt1).not.toBe(prompt2)
    })
  })

  describe('updateCanvasSize', () => {
    it('应该正确更新画布尺寸', () => {
      versusModel.updateCanvasSize(800, 600)
      const state = versusModel.getState()
      
      expect(state.canvasWidth).toBe(800)
      expect(state.canvasHeight).toBe(600)
    })

    it('应该处理零值', () => {
      versusModel.updateCanvasSize(0, 0)
      const state = versusModel.getState()
      
      expect(state.canvasWidth).toBe(0)
      expect(state.canvasHeight).toBe(0)
    })
  })

  describe('updateMatchState', () => {
    it('应该正确更新单个属性', () => {
      versusModel.updateMatchState({ userMuted: true })
      const state = versusModel.getState()
      
      expect(state.userMuted).toBe(true)
    })

    it('应该正确更新多个属性', () => {
      versusModel.updateMatchState({
        userMuted: true,
        isRecording: true,
        audioLevel: 50
      })
      const state = versusModel.getState()
      
      expect(state.userMuted).toBe(true)
      expect(state.isRecording).toBe(true)
      expect(state.audioLevel).toBe(50)
    })

    it('应该不影响未更新的属性', () => {
      const originalState = versusModel.getState()
      versusModel.updateMatchState({ userMuted: true })
      const newState = versusModel.getState()
      
      expect(newState.matchStarted).toBe(originalState.matchStarted)
      expect(newState.remainingTime).toBe(originalState.remainingTime)
    })
  })

  describe('switchSpeakingTurn', () => {
    it('应该从用户切换到伙伴', () => {
      versusModel.updateMatchState({ speakingTurn: 'user' })
      versusModel.switchSpeakingTurn()
      const state = versusModel.getState()
      
      expect(state.speakingTurn).toBe('partner')
    })

    it('应该从伙伴切换到用户', () => {
      versusModel.updateMatchState({ speakingTurn: 'partner' })
      versusModel.switchSpeakingTurn()
      const state = versusModel.getState()
      
      expect(state.speakingTurn).toBe('user')
    })
  })

  describe('transcriptMessages 管理', () => {
    it('应该正确添加消息', () => {
      const message: TranscriptMessage = { isUser: true, text: '测试消息' }
      versusModel.addTranscriptMessage(message)
      const state = versusModel.getState()
      
      expect(state.transcriptMessages).toHaveLength(1)
      expect(state.transcriptMessages[0]).toEqual(message)
    })

    it('应该能添加多条消息', () => {
      const message1: TranscriptMessage = { isUser: true, text: '用户消息' }
      const message2: TranscriptMessage = { isUser: false, text: '伙伴消息' }
      
      versusModel.addTranscriptMessage(message1)
      versusModel.addTranscriptMessage(message2)
      const state = versusModel.getState()
      
      expect(state.transcriptMessages).toHaveLength(2)
      expect(state.transcriptMessages[0]).toEqual(message1)
      expect(state.transcriptMessages[1]).toEqual(message2)
    })

    it('应该正确清空消息', () => {
      const message: TranscriptMessage = { isUser: true, text: '测试消息' }
      versusModel.addTranscriptMessage(message)
      versusModel.clearTranscriptMessages()
      const state = versusModel.getState()
      
      expect(state.transcriptMessages).toHaveLength(0)
    })
  })

  describe('nextTopic', () => {
    it('应该正确切换到下一个主题', () => {
      const originalTopicIndex = versusModel.getState().currentTopicIndex
      const originalPromptIndex = versusModel.getState().currentPromptIndex
      
      versusModel.nextTopic()
      const state = versusModel.getState()
      
      expect(state.currentTopicIndex).toBe((originalTopicIndex + 1) % 5)
      expect(state.currentPromptIndex).toBe((originalPromptIndex + 1) % 5)
    })

    it('应该清空消息记录', () => {
      const message: TranscriptMessage = { isUser: true, text: '测试消息' }
      versusModel.addTranscriptMessage(message)
      versusModel.nextTopic()
      const state = versusModel.getState()
      
      expect(state.transcriptMessages).toHaveLength(0)
    })

    it('应该在达到最大索引时回环', () => {
      // 设置到最后一个主题
      versusModel.updateMatchState({ currentTopicIndex: 4, currentPromptIndex: 4 })
      versusModel.nextTopic()
      const state = versusModel.getState()
      
      expect(state.currentTopicIndex).toBe(0)
      expect(state.currentPromptIndex).toBe(0)
    })
  })

  describe('resetMatch', () => {
    it('应该重置对战状态', () => {
      // 先修改一些状态
      versusModel.updateMatchState({
        matchStarted: true,
        remainingTime: 100,
        speakingTurn: 'partner',
        isUserSpeaking: true,
        isPartnerSpeaking: true,
        isRecording: true,
        audioLevel: 50,
        isPlayingAudio: true
      })
      
      versusModel.resetMatch()
      const state = versusModel.getState()
      
      expect(state.matchStarted).toBe(false)
      expect(state.remainingTime).toBe(300)
      expect(state.speakingTurn).toBe('user')
      expect(state.isUserSpeaking).toBe(false)
      expect(state.isPartnerSpeaking).toBe(false)
      expect(state.isRecording).toBe(false)
      expect(state.audioLevel).toBe(0)
      expect(state.isPlayingAudio).toBe(false)
    })

    it('应该不影响其他状态', () => {
      versusModel.updateMatchState({
        matchType: 'AI辅助',
        difficultyLevel: '高级',
        userMuted: true
      })
      
      const beforeReset = versusModel.getState()
      versusModel.resetMatch()
      const afterReset = versusModel.getState()
      
      expect(afterReset.matchType).toBe(beforeReset.matchType)
      expect(afterReset.difficultyLevel).toBe(beforeReset.difficultyLevel)
      expect(afterReset.userMuted).toBe(beforeReset.userMuted)
    })
  })

  describe('类型检查', () => {
    it('TranscriptMessage应该有正确的类型', () => {
      const message: TranscriptMessage = { isUser: true, text: '测试' }
      expect(typeof message.isUser).toBe('boolean')
      expect(typeof message.text).toBe('string')
    })

    it('VersusState应该有正确的类型结构', () => {
      const state = versusModel.getState()
      expect(typeof state.canvasWidth).toBe('number')
      expect(typeof state.canvasHeight).toBe('number')
      expect(typeof state.matchStarted).toBe('boolean')
      expect(typeof state.remainingTime).toBe('number')
      expect(['真人对战', 'AI辅助']).toContain(state.matchType)
      expect(['初级', '中级', '高级']).toContain(state.difficultyLevel)
      expect(['user', 'partner']).toContain(state.speakingTurn)
      expect(Array.isArray(state.transcriptMessages)).toBe(true)
    })
  })
}) 