# 第一阶段：构建阶段
FROM maven:3.8.6-openjdk-17-slim AS builder

# 安装git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 克隆GitHub仓库
RUN git clone https://github.com/zjxx/DeepTalk.git .

# 进入后端目录
WORKDIR /app/backend

# 下载依赖（这步可以被缓存）
RUN mvn dependency:go-offline -B

# 构建应用
RUN mvn clean package -DskipTests

# 验证jar文件是否生成
RUN ls -la target/ && \
    echo "Generated jar files:" && \
    find target/ -name "*.jar" -type f

# 第二阶段：运行阶段
FROM openjdk:17-jre-slim

# 安装curl用于健康检查
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN groupadd -r spring && useradd -r -g spring spring

# 设置工作目录
WORKDIR /app

# 从构建阶段复制jar文件（使用finalName指定的名称）
COPY --from=builder /app/backend/target/deeptalk.jar app.jar

# 更改文件所有者
RUN chown spring:spring app.jar

# 切换到非root用户
USER spring

# 暴露端口
EXPOSE 8080

# JVM优化参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseContainerSupport"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 