#!/bin/bash

# 检查MySQL服务状态
echo "检查MySQL服务状态..."
if systemctl is-active --quiet mysql; then
    echo "MySQL服务正在运行"
else
    echo "启动MySQL服务..."
    systemctl start mysql
fi


# 启动Spring Boot应用
echo "启动Spring Boot应用..."
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dkms.url=ws://127.0.0.1:8888/kurento"
