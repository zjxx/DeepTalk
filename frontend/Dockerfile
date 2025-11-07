# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 安装git
RUN apk add --no-cache git

# 设置工作目录
WORKDIR /app

# 克隆GitHub仓库
RUN git clone https://github.com/zjxx/DeepTalk.git .

# 进入前端目录
WORKDIR /app/frontend

# 安装依赖
RUN npm ci && npm cache clean --force

# 构建应用
RUN npm run build

# 第二阶段：生产阶段
FROM nginx:alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 