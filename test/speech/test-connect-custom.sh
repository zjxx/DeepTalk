#!/bin/bash

# --- 参数检查 ---
if [ "$#" -ne 2 ]; then
    echo "❌ 错误: 需要提供两个用户名作为参数。"
    echo "用法: $0 <用户名1> <用户名2>"
    exit 1
fi

# --- 配置信息 ---
API_URL_CONNECT="http://localhost:8080/api/speech/connect"
API_URL_DISCONNECT="http://localhost:8080/api/speech/disconnect"
USER1_ID="$1" # 从第一个命令行参数获取用户名1
USER2_ID="$2" # 从第二个命令行参数获取用户名2

# --- 连接阶段的临时文件 ---
connect_out1=$(mktemp)
connect_err1=$(mktemp)
connect_out2=$(mktemp)
connect_err2=$(mktemp)

# --- 断开连接阶段的临时文件 ---
declare disconnect_out1 disconnect_err1 disconnect_out2 disconnect_err2

# --- 确保脚本退出时清理临时文件 ---
trap 'rm -f "$connect_out1" "$connect_err1" "$connect_out2" "$connect_err2" \
               "$disconnect_out1" "$disconnect_err1" "$disconnect_out2" "$disconnect_err2" 2>/dev/null' EXIT

echo "### 阶段 1: 同时连接用户 ($USER1_ID, $USER2_ID) ###"
echo "---------------------------------------------"

# 命令 1: 后台连接用户1
echo "尝试连接用户 '$USER1_ID'..."
curl -v -X POST -H "Content-Type: application/json" \
     -d "{\"userId\": \"$USER1_ID\", \"sessionId\": \"null\"}" \
     "$API_URL_CONNECT" > "$connect_out1" 2> "$connect_err1" &
pid1=$!
sleep 0.5 # 可选: 确保第一个命令有时间开始执行

# 命令 2: 后台连接用户2
echo "尝试连接用户 '$USER2_ID'..."
curl -v -X POST -H "Content-Type: application/json" \
     -d "{\"userId\": \"$USER2_ID\", \"sessionId\": \"null\"}" \
     "$API_URL_CONNECT" > "$connect_out2" 2> "$connect_err2" &
pid2=$!

# 等待并获取连接命令的退出状态码
wait $pid1
status1=$?
echo "用户 '$USER1_ID' 的连接命令执行完毕，状态码: $status1"
wait $pid2
status2=$?
echo "用户 '$USER2_ID' 的连接命令执行完毕，状态码: $status2"

# 从curl命令的标准输出中提取SID
sid1=$(cat "$connect_out1")
sid2=$(cat "$connect_out2")

# --- 检查连接是否成功 ---
if [ $status1 -eq 0 ] && [ $status2 -eq 0 ]; then
    echo ""
    echo "✅ 两位用户均连接成功。"
    echo "用户 $USER1_ID 的 SID (sid1): $sid1"
    echo "用户 $USER2_ID 的 SID (sid2): $sid2"
    echo ""

    # --- 断开连接阶段的临时文件 ---
    disconnect_out1=$(mktemp)
    disconnect_err1=$(mktemp)
    disconnect_out2=$(mktemp)
    disconnect_err2=$(mktemp)

    echo "### 阶段 2: 同时断开用户连接 ###"
    echo "-----------------------------------------------"

    # 命令 3: 后台断开用户1的连接
    echo "尝试使用令牌 '$sid1' 断开用户 '$USER1_ID' 的连接..."
    curl -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"$USER1_ID\", \"sessionId\": \"$sid1\"}" \
         "$API_URL_DISCONNECT" > "$disconnect_out1" 2> "$disconnect_err1" &
    d_pid1=$!
    sleep 0.5 # 可选: 确保第一个断开连接命令有时间开始执行

    # 命令 4: 后台断开用户2的连接
    echo "尝试使用令牌 '$sid2' 断开用户 '$USER2_ID' 的连接..."
    curl -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"$USER2_ID\", \"sessionId\": \"$sid2\"}" \
         "$API_URL_DISCONNECT" > "$disconnect_out2" 2> "$disconnect_err2" &
    d_pid2=$!

    # 等待并获取断开连接命令的状态码
    wait $d_pid1
    d_status1=$?
    echo "用户 '$USER1_ID' 的断开连接命令执行完毕，状态码: $d_status1"
    wait $d_pid2
    d_status2=$?
    echo "用户 '$USER2_ID' 的断开连接命令执行完毕，状态码: $d_status2"
    echo ""

    # 输出断开连接命令的结果
    echo "--- 用户 $USER1_ID 断开连接输出 (状态: $d_status1) ---"
    echo "标准输出 (断开 $USER1_ID):"
    cat "$disconnect_out1"
    echo "--------------------------------------------------"
    echo ""

    echo "--- 用户 $USER2_ID 断开连接输出 (状态: $d_status2) ---"
    echo "标准输出 (断开 $USER2_ID):"
    cat "$disconnect_out2"
    echo "--------------------------------------------------"
    echo ""

    if [ $d_status1 -ne 0 ] || [ $d_status2 -ne 0 ]; then
        echo "⚠️ 警告: 一个或两个断开连接命令可能已失败。请检查上面的输出。"
    else
        echo "✅ 断开连接命令已完成。"
    fi
else
    echo ""
    echo "❌ 错误: 一个或两个连接命令失败。"
    echo "---------------------------------------------"
    echo "用户 '$USER1_ID' 连接尝试详情 (状态: $status1):"
    echo "标准输出 (可能的 sid1):"
    cat "$connect_out1"
    echo "标准错误 (详细输出):"
    cat "$connect_err1"
    echo "---------------------------------------------"
    echo "用户 '$USER2_ID' 连接尝试详情 (状态: $status2):"
    echo "标准输出 (可能的 sid2):"
    cat "$connect_out2"
    echo "标准错误 (详细输出):"
    cat "$connect_err2"
    echo "---------------------------------------------"
    exit 1 # 带错误码退出
fi

echo ""
echo "脚本执行完毕。"
