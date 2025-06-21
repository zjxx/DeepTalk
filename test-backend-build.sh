#!/bin/bash

echo "=== DeepTalk 后端构建测试脚本 ==="
echo

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "创建临时目录: $TEMP_DIR"

# 进入临时目录
cd "$TEMP_DIR"

echo "克隆GitHub仓库..."
git clone https://github.com/zjxx/DeepTalk.git
cd DeepTalk/backend

echo
echo "=== 检查Maven配置 ==="
echo "检查pom.xml文件..."
if [ -f "pom.xml" ]; then
    echo "✓ pom.xml 文件存在"
    echo "项目信息:"
    grep -E "(groupId|artifactId|version|packaging)" pom.xml | head -4
else
    echo "✗ pom.xml 文件不存在"
    exit 1
fi

echo
echo "=== 下载依赖 ==="
mvn dependency:go-offline -B

echo
echo "=== 构建项目 ==="
mvn clean package -DskipTests

echo
echo "=== 检查生成的文件 ==="
echo "target 目录内容:"
ls -la target/

echo
echo "生成的jar文件:"
find target/ -name "*.jar" -type f -exec ls -lh {} \;

echo
echo "=== 验证jar文件可执行性 ==="
JAR_FILE=$(find target/ -name "*.jar" -not -name "*sources*" -not -name "*javadoc*" | head -1)
if [ -n "$JAR_FILE" ]; then
    echo "找到jar文件: $JAR_FILE"
    echo "文件大小: $(du -h "$JAR_FILE" | cut -f1)"
    
    # 尝试查看jar文件的manifest
    echo "检查jar文件manifest:"
    unzip -p "$JAR_FILE" META-INF/MANIFEST.MF | head -10
    
    echo
    echo "✓ 构建成功！可以在Docker中使用此jar文件"
else
    echo "✗ 没有找到可执行的jar文件"
    exit 1
fi

echo
echo "=== 清理临时文件 ==="
cd /
rm -rf "$TEMP_DIR"
echo "✓ 清理完成"

echo
echo "=== 构建建议 ==="
echo "1. 确保在pom.xml中配置了正确的finalName"
echo "2. 使用spring-boot-maven-plugin生成可执行jar"
echo "3. 在Dockerfile中使用正确的jar文件路径" 