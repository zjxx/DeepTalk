# 📚 DeepTalk 项目文档索引

## 🎯 核心文档（必读）

### 1. 项目说明
- **README.md** - 项目总览、功能介绍、技术栈

### 2. 安全配置
- **API-KEY-SECURITY-SETUP.md** - API密钥安全配置完整指南
  - 如何配置环境变量
  - 前后端密钥设置
  - 安全最佳实践

### 3. 快速启动
- **QUICK-START-AI-REPLY.md** - 3分钟快速启动AI自动回复功能
  - 环境配置步骤
  - 启动服务命令
  - 功能测试指南

### 4. 部署指南
- **DOCKER_DEPLOYMENT.md** - Docker容器化部署
  - docker-compose配置
  - 生产环境部署

### 5. 开发报告
- **GIT-PUSH-SUCCESS-REPORT.md** - 最新功能实现报告
  - AI自动回复功能
  - 异步处理优化
  - API密钥安全加固

---

## 📂 项目结构

```
DeepTalk_zt/
├── 📖 README.md                        主项目文档
├── 🔐 API-KEY-SECURITY-SETUP.md        安全配置指南
├── ⚡ QUICK-START-AI-REPLY.md          快速启动指南
├── 🐳 DOCKER_DEPLOYMENT.md             部署文档
├── 📊 GIT-PUSH-SUCCESS-REPORT.md       最新开发报告
├── 🔒 check-commit-security.ps1        Git提交安全检查
├── 📝 Lab2.pdf                         作业文档
│
├── backend/                            后端源码（Spring Boot）
│   ├── src/
│   │   ├── main/java/
│   │   │   └── com/example/deeptalk/
│   │   │       ├── modules/
│   │   │       │   ├── community/     社区功能（含AI回复）
│   │   │       │   ├── auth/          用户认证
│   │   │       │   ├── battle/        对战系统
│   │   │       │   └── speech/        语音处理
│   │   │       └── config/            配置类
│   │   └── resources/
│   │       ├── application.yml        配置文件
│   │       └── application.yml.example 配置示例
│   └── pom.xml                        Maven依赖
│
├── frontend/                          前端源码（Vue 3 + TypeScript）
│   ├── src/
│   │   ├── views/                     页面组件
│   │   ├── components/                通用组件
│   │   ├── services/                  服务层
│   │   │   ├── GeminiService.ts       Gemini API集成
│   │   │   ├── AIService.ts           AI服务统一接口
│   │   │   └── HuggingFaceService.ts  HuggingFace备用
│   │   ├── controllers/               控制器
│   │   └── api/                       API调用
│   ├── .env.example                   环境变量示例
│   └── package.json                   依赖配置
│
└── document/                          项目文档
    └── ...
```

---

## 🚀 快速上手指南

### 1. 配置API密钥（必须）

#### 后端配置
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key"

# Linux/Mac
export GEMINI_API_KEY="your_gemini_api_key"
```

#### 前端配置
```bash
cd frontend
cp .env.example .env.local
# 编辑 .env.local 填入：VITE_GEMINI_API_KEY=your_key
```

### 2. 启动服务

```bash
# 后端（端口8080）
cd backend
mvn spring-boot:run

# 前端（端口5173）
cd frontend
npm install
npm run dev
```

### 3. 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:8080

---

## 🔑 核心功能

### ✅ 已实现
1. **用户认证** - JWT登录、注册、记住我
2. **社区功能** - 发帖、点赞、搜索
3. **AI自动回复** - Gemini API集成，异步生成回复
4. **对战系统** - AI对话练习（多难度、多主题）
5. **语音识别** - 实时语音转文字
6. **TTS语音合成** - 文字转语音播放
7. **Live2D角色** - 虚拟助手展示

### 🔐 安全特性
- API密钥环境变量管理
- Git提交前安全检查
- 敏感文件自动忽略
- CORS跨域配置

---

## 📝 开发规范

### Git提交前检查
```powershell
# 运行安全检查脚本
.\check-commit-security.ps1
```

### 环境变量配置
- ✅ 使用 `.env.local`（前端）和环境变量（后端）
- ❌ 不要硬编码API密钥
- ❌ 不要提交 `.env.local` 到Git

### 代码风格
- 后端：Java + Spring Boot标准
- 前端：Vue 3 Composition API + TypeScript
- 异步操作：使用 `@Async` 或 Promise

---

## 🆘 常见问题

### Q1: 后端启动失败，端口8080被占用？
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:8080 | xargs kill
```

### Q2: AI回复不生成？
1. 检查 `GEMINI_API_KEY` 是否配置
2. 查看后端日志是否有 "🔑 Gemini API密钥已加载"
3. 确认线程名包含 "task-"（异步生效）

### Q3: 前端无法连接后端？
1. 确认后端已启动（端口8080）
2. 检查 CORS 配置
3. 查看浏览器控制台网络请求

---

## 📞 技术支持

- **Issue**: 在GitHub仓库提交Issue
- **文档**: 查看各模块的详细文档
- **日志**: 查看后端控制台和前端浏览器控制台

---

## 📈 版本历史

### v2.0 (2025-11-06)
- ✨ AI自动回复功能
- ✨ Gemini API集成
- 🔐 API密钥安全加固
- ♻️ 异步处理优化

### v1.0
- ✨ 基础社区功能
- ✨ 用户认证系统
- ✨ 对战系统
- ✨ 语音识别和TTS

---

**最后更新**: 2025年11月6日
