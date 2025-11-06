# 🔐 API密钥安全配置指南

## ⚠️ 重要安全提醒

**永远不要将API密钥提交到Git仓库！**

API密钥一旦泄露到公开仓库：
- ❌ 会被自动扫描工具发现
- ❌ 可能在几分钟内被滥用
- ❌ 导致您的账户被盗用或产生高额费用
- ❌ API提供商可能会立即撤销该密钥

---

## 📋 配置步骤

### 1. 后端配置 (Spring Boot)

#### 方法A：使用环境变量（推荐用于生产环境）

**Linux/Mac**:
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

**Windows PowerShell**:
```powershell
$env:GEMINI_API_KEY="your_actual_api_key_here"
```

**Windows CMD**:
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
```

#### 方法B：使用本地配置文件（推荐用于开发环境）

1. 复制示例配置文件：
   ```bash
   cd backend/src/main/resources
   cp application.yml.example application-local.yml
   ```

2. 编辑 `application-local.yml`，填入您的API密钥：
   ```yaml
   gemini:
     api:
       key: YOUR_ACTUAL_GEMINI_API_KEY
   ```

3. 在启动时指定配置文件：
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

4. **确保 `application-local.yml` 已在 `.gitignore` 中**（已配置）

---

### 2. 前端配置 (Vite + Vue)

1. 复制示例配置文件：
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入您的API密钥：
   ```env
   VITE_GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
   VITE_GEMINI_MODEL=gemini-2.5-flash
   ```

3. **确保 `.env.local` 已在 `.gitignore` 中**（已配置）

---

## 🔍 检查配置是否正确

### 后端检查

启动后端服务后，查看日志：
```
✅ 正确: 🔑 Gemini API密钥已加载: AIzaSyDbkdu50nr...
❌ 错误: ⚠️ Gemini API密钥未配置，将使用备用回复
```

### 前端检查

打开浏览器控制台，查看是否有警告：
```
✅ 正确: 没有API密钥相关警告
❌ 错误: ⚠️ Gemini API密钥未配置，请在.env.local中设置VITE_GEMINI_API_KEY
```

---

## 🚫 已被保护的敏感文件

以下文件已在 `.gitignore` 中配置，**不会被提交到Git**：

### 前端
- ✅ `frontend/.env.local`
- ✅ `frontend/.env.development.local`
- ✅ `frontend/.env.production.local`

### 后端
- ✅ `backend/src/main/resources/application-local.yml`
- ✅ `backend/src/main/resources/application-dev.yml`

### 测试文件
- ✅ `test-openrouter-api.ps1`
- ✅ `quick-test-api.ps1`
- ✅ `frontend/public/test-openrouter.html`

---

## ✅ 安全检查清单

在提交代码前，请确保：

- [ ] 所有代码中**没有硬编码的API密钥**
- [ ] `.env.local` 文件**未被追踪**（使用 `git status` 检查）
- [ ] `application-local.yml` 文件**未被追踪**
- [ ] 已创建 `.env.example` 和 `application.yml.example` 示例文件
- [ ] 示例文件中使用占位符（如 `YOUR_API_KEY_HERE`）
- [ ] `.gitignore` 包含所有敏感文件模式

---

## 🔧 如何检查是否有敏感信息泄露

### 方法1：检查Git暂存区
```bash
git diff --cached
```
查看即将提交的内容，确认没有API密钥。

### 方法2：搜索可能的API密钥
```bash
# 在Git追踪的文件中搜索可能的密钥模式
git grep -i "api.key"
git grep -i "AIza"  # Gemini密钥前缀
```

### 方法3：使用工具扫描
```bash
# 安装 gitleaks（可选）
# https://github.com/gitleaks/gitleaks
gitleaks detect --source .
```

---

## 🆘 如果不小心提交了API密钥怎么办？

### 1. 立即撤销密钥
- 前往API提供商控制台
- 撤销被泄露的密钥
- 生成新的密钥

### 2. 从Git历史中移除（如果已推送）
```bash
# 警告：这会重写Git历史！
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive/file" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（会覆盖远程仓库）
git push origin --force --all
```

### 3. 通知团队成员
如果在团队协作中，通知所有成员更新本地仓库。

---

## 📚 最佳实践总结

### ✅ 应该做的事：
1. **始终使用环境变量或本地配置文件**
2. **将敏感文件添加到 `.gitignore`**
3. **提供示例配置文件（不含真实密钥）**
4. **在README中说明配置步骤**
5. **定期轮换API密钥**

### ❌ 不应该做的事：
1. **在代码中硬编码API密钥**
2. **将 `.env.local` 提交到Git**
3. **在配置文件中使用默认值作为真实密钥**
4. **在公开仓库的Issue/PR中粘贴密钥**
5. **在日志中打印完整的API密钥**

---

## 🔗 相关文档

- [Gemini API 文档](https://ai.google.dev/docs)
- [12-Factor App: 配置管理](https://12factor.net/config)
- [OWASP API 安全](https://owasp.org/www-project-api-security/)

---

## 📞 需要帮助？

如果您在配置过程中遇到问题：

1. 查看服务启动日志
2. 检查环境变量是否正确设置
3. 确认 `.env.local` 文件位置和内容
4. 参考本项目的 `README.md`

**记住：安全第一！永远不要在公开场合分享您的API密钥。** 🔒
