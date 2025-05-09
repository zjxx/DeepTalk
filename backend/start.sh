#!/bin/bash

# 检查MySQL服务状态
echo "检查MySQL服务状态..."
if systemctl is-active --quiet mysql; then
    echo "MySQL服务正在运行"
else
    echo "启动MySQL服务..."
    systemctl start mysql
fi

# 执行数据库初始化脚本
echo "执行数据库初始化脚本..."
mysql -u root -p'DeepTalk@2024' deeptalk < src/main/resources/db/init.sql

# 启动Spring Boot应用
echo "启动Spring Boot应用..."
mvn spring-boot:run 