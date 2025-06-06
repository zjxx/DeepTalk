# 题库接口使用指南

## 概述

新的题库接口系统已经集成到项目中，**不影响现有的人物模型和VersusModel结构**。系统提供了丰富的题目数据，支持随机抽取、难度筛选等功能。

## 主要特点

✅ **不修改现有结构** - 完全独立的API系统  
✅ **向后兼容** - 保持原有功能正常运行  
✅ **智能切换** - 优先使用题库，备用原有题目  
✅ **丰富题目** - 10个预置题目，3个难度等级  
✅ **多种分类** - 8个分类，多样化内容  

## 文件结构

```
src/
├── api/
│   └── QuestionBankAPI.ts       # 题库API接口
├── utils/
│   └── QuestionManager.ts       # 题库管理工具
├── components/
│   └── QuestionBankDemo.vue     # 演示组件
└── controllers/
    └── VersusController.ts      # 已集成题库功能
```

## 使用方法

### 1. 基本API调用

```typescript
import { getRandomQuestion, getQuestionByDifficulty } from '../api/QuestionBankAPI'

// 获取随机题目
const response = await getRandomQuestion()
if (response.success && response.data) {
  console.log('题目:', response.data.topic)
  console.log('提示:', response.data.prompts)
}

// 按难度获取题目
const advanced = await getQuestionByDifficulty('advanced')
```

### 2. 在Controller中使用（已集成）

```typescript
// VersusController 已经集成了题库功能
// 开始对战时会自动加载题目
await controller.startMatch()

// 切换到下一个题目
controller.nextTopic()

// 获取当前题目和提示
const topic = controller.currentTopic
const prompt = controller.currentPrompt
```

### 3. 使用QuestionManager

```typescript
import { QuestionManager } from '../utils/QuestionManager'

const questionManager = new QuestionManager()

// 加载新题目
await questionManager.loadQuestionByLevel('中级')

// 获取题目信息
const topic = questionManager.getCurrentTopic()
const prompts = questionManager.getCurrentPrompts()
```

## 题目数据结构

```typescript
interface QuestionData {
  id: string                    // 唯一标识
  topic: string                 // 题目标题
  description: string           // 题目描述
  prompts: string[]            // 对话提示列表
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string             // 分类
  tags: string[]               // 标签
  estimatedTime: number        // 预计时间（分钟）
}
```

## 预置题目分类

- **lifestyle** - 生活方式（日常、饮食、爱好）
- **society** - 社会话题（科技、教育）
- **career** - 职业相关（工作平衡）
- **environment** - 环境保护
- **culture** - 文化认同
- **technology** - 科技伦理
- **health** - 心理健康
- **personal** - 个人成长

## 集成效果

### 在对话系统中的变化：

1. **开始对战** - 自动加载符合难度的随机题目
2. **下一话题** - 智能切换新题目，避免重复
3. **题目显示** - 优先显示题库题目，备用原有题目
4. **提示系统** - 使用题库中的专业提示

### 用户体验提升：

- 🎯 **内容丰富** - 多样化的对话主题
- 🔄 **避免重复** - 智能排除已使用题目
- 📈 **难度匹配** - 根据用户选择的难度提供合适题目
- 🏷️ **分类清晰** - 不同类型的对话场景

## 演示和测试

使用 `QuestionBankDemo.vue` 组件可以：

- 测试API调用
- 查看题库统计
- 按难度筛选题目
- 查看API调用记录

## 后端对接

当后端实现时，只需要：

1. 修改 `QuestionBankAPI.ts` 中的数据来源
2. 将模拟数据替换为真实API调用
3. 添加错误处理和缓存机制

## 注意事项

- ✅ 不影响现有的Live2D人物模型
- ✅ 不修改VersusModel的核心结构
- ✅ 完全向后兼容
- ✅ 可以随时禁用题库功能回到原有模式

## 故障排除

如果遇到问题：

1. 检查 `QuestionManager` 是否正确初始化
2. 确认API调用是否成功返回数据
3. 查看浏览器控制台的错误信息
4. 题库为空时会自动回退到原有题目系统