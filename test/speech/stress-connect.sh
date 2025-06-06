#!/bin/bash

# 定义要调用的连接脚本的路径
CONNECT_SCRIPT="./test-connect-custom.sh"
TOTAL_RUNS=100

# 检查连接脚本是否存在且可执行
if [ ! -x "$CONNECT_SCRIPT" ]; then
    echo "❌ 错误: 连接脚本 '$CONNECT_SCRIPT' 不存在或不可执行。"
    echo "请确保 test-connect-custom.sh 在当前目录，并已使用 'chmod +x test-connect-custom.sh' 命令赋予其执行权限。"
    exit 1
fi

echo "🚀 开始执行 $TOTAL_RUNS 次随机用户连接测试..."

# 循环执行100次
for i in $(seq 1 $TOTAL_RUNS)
do
    echo ""
    echo "============================================="
    echo "                第 $i/$TOTAL_RUNS 次测试"
    echo "============================================="

    # 生成两个随机的用户名
    USER1="user_$(date +%s%N | sha256sum | base64 | head -c 8)"
    USER2="user_$(date +%s%N | sha256sum | base64 | head -c 8)"

    echo "正在使用随机用户名进行测试: '$USER1', '$USER2'"
    echo "---------------------------------------------"

    # 执行连接脚本并传入随机用户名
    $CONNECT_SCRIPT "$USER1" "$USER2"
    
    # 获取连接脚本的退出状态码
    status=$?

    # 检查状态码，如果不为0，则表示有错误发生
    if [ $status -ne 0 ]; then
        echo ""
        echo "❌ 测试中断: 第 $i 次测试失败 (用户名: $USER1, $USER2)，脚本退出状态码为: $status。"
        echo "请检查上面的日志以了解详细错误信息。"
        exit 1 # 立即退出整个测试脚本
    fi

    echo "✅ 第 $i 次测试成功。"
done

echo ""
echo "🎉🎉🎉"
echo "✅ 所有 $TOTAL_RUNS 次测试均已成功完成！"
echo "🎉🎉🎉"
