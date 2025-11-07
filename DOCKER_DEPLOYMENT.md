# DeepTalk Docker 部署指南

本指南介绍如何使用Docker部署DeepTalk应用，支持直接从GitHub仓库拉取代码进行构建和部署。

## 快速开始

### 方式一：使用docker-compose（推荐）

1. 下载必要文件：
```bash
# 创建项目目录
mkdir deeptalk-deploy && cd deeptalk-deploy

# 下载docker-compose.yml
wget https://raw.githubusercontent.com/zjxx/DeepTalk/main/docker-compose.yml

# 下载前端Dockerfile
mkdir frontend
wget -O frontend/Dockerfile https://raw.githubusercontent.com/zjxx/DeepTalk/main/frontend/Dockerfile

# 下载后端Dockerfile  
mkdir backend
wget -O backend/Dockerfile https://raw.githubusercontent.com/zjxx/DeepTalk/main/backend/Dockerfile
```

2. 启动所有服务：
```bash
docker-compose up -d
```

3. 查看服务状态：
```bash
docker-compose ps
```

4. 查看日志：
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

### 方式二：单独构建镜像

#### 构建前端镜像

```bash
# 下载前端Dockerfile
mkdir frontend && cd frontend
wget https://raw.githubusercontent.com/zjxx/DeepTalk/main/frontend/Dockerfile

# 构建镜像
docker build -t deeptalk-frontend .

# 运行容器
docker run -d -p 80:80 --name deeptalk-frontend deeptalk-frontend
```

#### 构建后端镜像

```bash
# 下载后端Dockerfile
mkdir backend && cd backend  
wget https://raw.githubusercontent.com/zjxx/DeepTalk/main/backend/Dockerfile

# 构建镜像
docker build -t deeptalk-backend .

# 运行容器（需要先启动数据库）
docker run -d -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/deeptalk \
  -e SPRING_DATASOURCE_USERNAME=deeptalk \
  -e SPRING_DATASOURCE_PASSWORD=deeptalk123 \
  --name deeptalk-backend deeptalk-backend
```

## 服务访问地址

部署成功后，可以通过以下地址访问服务：

- **前端应用**: http://localhost
- **后端API**: http://localhost:8080
- **后端健康检查**: http://localhost:8080/actuator/health
- **数据库**: localhost:5432

## 环境变量配置

### 后端环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://database:5432/deeptalk` | 数据库连接URL |
| `SPRING_DATASOURCE_USERNAME` | `deeptalk` | 数据库用户名 |
| `SPRING_DATASOURCE_PASSWORD` | `deeptalk123` | 数据库密码 |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Hibernate DDL策略 |
| `SERVER_PORT` | `8080` | 应用端口 |
| `JAVA_OPTS` | `-Xms512m -Xmx1024m -XX:+UseG1GC` | JVM参数 |

### 数据库环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `POSTGRES_DB` | `deeptalk` | 数据库名 |
| `POSTGRES_USER` | `deeptalk` | 数据库用户 |
| `POSTGRES_PASSWORD` | `deeptalk123` | 数据库密码 |

## 常用命令

### Docker Compose命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart frontend

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 重新构建并启动
docker-compose up -d --build

# 停止并删除所有容器、网络、卷
docker-compose down -v
```

### Docker命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器日志
docker logs -f container_name

# 进入容器
docker exec -it container_name /bin/sh

# 删除容器
docker rm container_name

# 删除镜像
docker rmi image_name
```

## 故障排除

### 1. 前端无法访问后端API

检查nginx配置中的proxy_pass设置：
```bash
docker exec -it deeptalk-frontend cat /etc/nginx/conf.d/default.conf
```

### 2. 后端连接数据库失败

检查数据库是否启动：
```bash
docker-compose logs database
```

检查后端环境变量：
```bash
docker-compose exec backend env | grep SPRING
```

### 3. 服务健康检查失败

查看健康检查状态：
```bash
docker-compose ps
```

手动测试健康检查：
```bash
curl http://localhost:8080/actuator/health
```

### 4. 后端jar文件生成问题

如果后端构建失败或找不到jar文件：

1. **检查Maven构建日志**：
```bash
docker-compose build backend
# 或
docker build -f backend/Dockerfile .
```

2. **验证jar文件生成**：
```bash
# 运行测试脚本（如果有）
chmod +x test-backend-build.sh
./test-backend-build.sh
```

3. **手动测试构建过程**：
```bash
# 克隆仓库
git clone https://github.com/zjxx/DeepTalk.git
cd DeepTalk/backend

# 构建项目
mvn clean package -DskipTests

# 检查生成的jar文件
ls -la target/*.jar
```

4. **常见的jar文件生成问题**：
   - `pom.xml` 缺少 `spring-boot-maven-plugin` 配置
   - 缺少 `packaging` 声明
   - 依赖下载失败
   - Java版本不匹配

### 5. 构建过程中网络问题

如果在构建过程中遇到网络问题，可以：

1. 使用国内镜像加速：
```bash
# 在Dockerfile中添加npm镜像
RUN npm config set registry https://registry.npmmirror.com

# 或使用Maven阿里云镜像
# 在pom.xml中配置mirrors
```

2. 使用代理：
```bash
docker build --build-arg http_proxy=http://proxy:port .
```

## 性能优化

### 1. 镜像大小优化

当前Dockerfile已经使用了多阶段构建来优化镜像大小：
- 前端镜像：约50MB（nginx:alpine基础）
- 后端镜像：约200MB（openjdk:17-jre-slim基础）

### 2. 构建缓存优化

为了加速构建，建议：
- 保持依赖文件（package.json, pom.xml）的稳定
- 使用Docker BuildKit进行并行构建

### 3. 运行时优化

- 前端：启用了gzip压缩和静态资源缓存
- 后端：配置了G1GC和容器内存限制
- 数据库：使用了持久化卷存储

## 生产环境部署建议

1. **使用外部数据库**：生产环境建议使用云数据库服务
2. **配置HTTPS**：添加SSL证书和反向代理
3. **监控日志**：集成ELK或其他日志管理系统
4. **备份策略**：定期备份数据库和重要配置
5. **资源限制**：在docker-compose.yml中添加资源限制
6. **安全配置**：修改默认密码，配置防火墙规则

## 更新部署

当GitHub仓库代码更新后，重新部署：

```bash
# 重新构建所有镜像
docker-compose build --no-cache

# 重启服务
docker-compose up -d
```

或者单独更新某个服务：
```bash
# 只更新前端
docker-compose build --no-cache frontend
docker-compose up -d frontend
``` 