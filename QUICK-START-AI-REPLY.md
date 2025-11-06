# ⚡ 快速启动指南 - AI自动回复功能

## 🚀 3分钟快速启动

### 第1步：配置API密钥（必须）

#### Windows PowerShell:
```powershell
# 后端
$env:GEMINI_API_KEY="your_actual_gemini_api_key"

# 前端
cd frontend
cp .env.example .env.local
# 用记事本编辑 .env.local，填入：
# VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

#### Linux/Mac:
```bash
# 后端
export GEMINI_API_KEY="your_actual_gemini_api_key"

# 前端
cd frontend
cp .env.example .env.local
# 编辑 .env.local 填入密钥
```

---

### 第2步：启动服务

```bash
# 终端1 - 后端
cd backend
mvn spring-boot:run

# 终端2 - 前端
cd frontend
npm run dev
```

---

### 第3步：测试功能

1. **打开浏览器** → `http://localhost:5173`
2. **登录系统**
3. **发布测试帖子**：
   - 标题: "测试AI自动回复"
   - 内容: "这是一个测试帖子"
4. **等待2-3秒**
5. **刷新页面** → 应该看到AI助手的回复

---

## 🔍 验证日志

### ✅ 后端成功日志：
```
🔑 Gemini API密钥已加载: AIzaSyDbkdu50nr...
🌐 Gemini API URL: https://zjxx.lol/v1beta/models/gemini-2.5-flash:generateContent
...
🧵 异步线程: task-1
🤖 开始为帖子生成AI回复: abc-123-def
✅ API密钥已配置，准备调用Gemini API...
💬 AI生成的回复: 感谢分享！这是一个很有意思的话题...
✅ AI回复已保存到数据库
```

### ❌ 常见错误：

**错误1**: `⚠️ Gemini API密钥未配置`
- **原因**: 环境变量未设置
- **解决**: 重新执行第1步

**错误2**: 线程显示 `http-nio-8080-exec-1`（而不是 `task-1`）
- **原因**: 异步未生效
- **解决**: 重新编译 `mvn clean compile`

**错误3**: `Connection timeout`
- **原因**: 网络问题或API限制
- **解决**: 检查网络连接，等待后重试

---

## 📊 快速检查清单

- [ ] 后端环境变量 `GEMINI_API_KEY` 已设置
- [ ] 前端 `.env.local` 文件已创建并配置
- [ ] 后端服务启动成功（端口8080）
- [ ] 前端服务启动成功（端口5173）
- [ ] 发帖后看到异步线程日志
- [ ] 2-3秒后AI回复保存成功
- [ ] 前端可以看到AI回复（带🤖图标）

---

## 🆘 快速故障排除

| 问题 | 解决方案 |
|------|---------|
| 后端无法启动 | 检查8080端口是否被占用 |
| 前端无法启动 | 运行 `npm install` |
| AI回复不出现 | 查看后端控制台日志 |
| API调用失败 | 检查API密钥是否正确 |
| 异步不工作 | 确认看到 `task-` 开头的线程名 |

---

## 📚 完整文档

- **安全配置**: `API-KEY-SECURITY-SETUP.md`
- **功能详解**: `AI-AUTO-REPLY-FIX-COMPLETE.md`
- **推送报告**: `GIT-PUSH-SUCCESS-REPORT.md`

---

## 🔗 相关命令

```bash
# 重新编译
mvn clean compile

# 查看日志
tail -f backend/logs/spring.log  # Linux/Mac
Get-Content backend/logs/spring.log -Wait  # Windows

# 查看Git状态
git status
git log --oneline -5

# 运行安全检查
powershell -ExecutionPolicy Bypass -File check-commit-security.ps1
```

---

**提示**: 首次配置后，以后只需执行第2步即可启动服务 🚀
