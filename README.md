# DeepTalk - 英语口语练习平台

DeepTalk是一个创新的英语口语练习平台，提供在线匹配、AI辅助练习等功能。

## 项目结构

```
DeepTalk/
├── backend/           # 后端代码
│   ├── src/          # 源代码
│   ├── pom.xml       # Maven配置
│   └── README.md     # 后端说明文档
├── frontend/         # 前端代码（开发中）
│   ├── src/          # 源代码
│   ├── package.json  # NPM配置
│   └── README.md     # 前端说明文档
└── README.md         # 项目主说明文档
```

## 功能特性

- 四六级口语练习
  - 真人匹配练习
  - GPT辅助练习
  - 实时录音和评分
- 学习社区
  - 学习日记
  - 经验分享
  - 互动交流
- 智能评估
  - GPT评分反馈
  - 学习进度追踪

## 技术栈

### 后端
- Spring Boot
- Spring Security
- MySQL
- JPA

### 前端（开发中）
- React/Vue
- TypeScript
- Ant Design/Element UI

## 开发指南

### 后端开发
1. 进入backend目录
2. 执行mvn clean install（每次更改了maven需要，第一次也需要）
3. mvn spring-boot:run 

### 前端开发（待开发）
1. 进入frontend目录
2. 执行 `npm install` 安装依赖
3. 执行 `npm start` 启动开发服务器

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

[MIT License](LICENSE) 