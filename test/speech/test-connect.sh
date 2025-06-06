#!/bin/bash

# --- 配置信息 ---
API_URL_CONNECT="http://localhost:8080/api/speech/connect"
API_URL_DISCONNECT="http://localhost:8080/api/speech/disconnect"
USER1_ID="ChPu437"
USER2_ID="zjxx"

# --- 连接阶段的临时文件 ---
# 这些文件将存储连接命令的标准输出 (可能是SID) 和标准错误 (curl的详细输出)
connect_out1=$(mktemp)
connect_err1=$(mktemp)
connect_out2=$(mktemp)
connect_err2=$(mktemp)

# --- 断开连接阶段的临时文件 (在连接成功后声明) ---
declare disconnect_out1 disconnect_err1 disconnect_out2 disconnect_err2

# --- 确保脚本退出时清理临时文件 ---
# 这个 trap 会在脚本退出时执行，无论正常完成、出错或收到信号。
trap 'rm -f "$connect_out1" "$connect_err1" "$connect_out2" "$connect_err2" \
               "$disconnect_out1" "$disconnect_err1" "$disconnect_out2" "$disconnect_err2" 2>/dev/null' EXIT

echo "### 阶段 1: 同时连接用户 ###"
echo "---------------------------------------------"

# 命令 1: 后台连接用户1 (ChPu437)
echo "尝试连接用户 '$USER1_ID'..."
curl -v -X POST -H "Content-Type: application/json" \
     -d "{\"userId\": \"$USER1_ID\", \"sessionId\": \"null\"}" \
     "$API_URL_CONNECT" > "$connect_out1" 2> "$connect_err1" &
pid1=$! # 获取后台命令的进程ID (PID)

sleep 1 # 可选: 确保第一个命令有时间开始执行

# 命令 2: 后台连接用户2 (zjxx)
echo "尝试连接用户 '$USER2_ID'..."
curl -v -X POST -H "Content-Type: application/json" \
     -d "{\"userId\": \"$USER2_ID\", \"sessionId\": \"null\"}" \
     "$API_URL_CONNECT" > "$connect_out2" 2> "$connect_err2" &
pid2=$! # 获取后台命令的进程ID (PID)

# 等待第一个连接命令完成并获取其退出状态码
wait $pid1
status1=$?
echo "用户 '$USER1_ID' 的连接命令执行完毕，状态码: $status1"

# 等待第二个连接命令完成并获取其退出状态码
wait $pid2
status2=$?
echo "用户 '$USER2_ID' 的连接命令执行完毕，状态码: $status2"

# 从curl命令的标准输出中提取SID
# 重要提示: 此处假设 curl 命令的*整个*标准输出就是 SID。
# 如果 SID 是 JSON 响应的一部分 (例如 {"sessionId": "实际的sid值"}),
# 你需要解析 JSON, 例如使用 'jq':
# sid1=$(jq -r .sessionId "$connect_out1")
# sid2=$(jq -r .sessionId "$connect_out2")
# 如果使用此方法，请确保已安装 'jq'。
sid1=$(cat "$connect_out1")
sid2=$(cat "$connect_out2")

# --- 检查两个连接命令是否都成功 (退出状态码为 0) ---
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

    # 命令 3: 后台使用 sid1 断开用户1 (ChPu437) 的连接
    echo "尝试使用令牌 '$sid1' 断开用户 '$USER1_ID' 的连接..."
    curl -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"$USER1_ID\", \"sessionId\": \"$sid1\"}" \
         "$API_URL_DISCONNECT" > "$disconnect_out1" 2> "$disconnect_err1" &
    d_pid1=$!

    sleep 1 # 可选: 确保第一个断开连接命令有时间开始执行

    # 命令 4: 后台使用 sid2 断开用户2 (zjxx) 的连接
    echo "尝试使用令牌 '$sid2' 断开用户 '$USER2_ID' 的连接..."
    curl -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"$USER2_ID\", \"sessionId\": \"$sid2\"}" \
         "$API_URL_DISCONNECT" > "$disconnect_out2" 2> "$disconnect_err2" &
    d_pid2=$!

    # 等待断开连接命令完成并获取其状态码
    wait $d_pid1
    d_status1=$?
    echo "用户 '$USER1_ID' 的断开连接命令执行完毕，状态码: $d_status1"
    echo "Session ID (sid1): $sid1"

    wait $d_pid2
    d_status2=$?
    echo "用户 '$USER2_ID' 的断开连接命令执行完毕，状态码: $d_status2"
    echo "Session ID (sid2): $sid2"
    echo ""

    # 输出断开连接命令的结果
    echo "--- 用户 $USER1_ID 断开连接输出 (状态: $d_status1) ---"
    echo "标准输出 (断开 $USER1_ID):"
    cat "$disconnect_out1"
#    echo ""
#    echo "标准错误 / 详细输出 (断开 $USER1_ID):"
#    cat "$disconnect_err1"
    echo "--------------------------------------------------"
    echo ""

    echo "--- 用户 $USER2_ID 断开连接输出 (状态: $d_status2) ---"
    echo "标准输出 (断开 $USER2_ID):"
    cat "$disconnect_out2"
#    echo ""
#    echo "标准错误 / 详细输出 (断开 $USER2_ID):"
#    cat "$disconnect_err2"
    echo "--------------------------------------------------"
    echo ""

    if [ $d_status1 -ne 0 ] || [ $d_status2 -ne 0 ]; then
        echo "⚠️ 警告: 一个或两个断开连接命令可能已失败。请检查上面的输出。"
        # exit 2 # 可选: 如果断开连接失败，则使用特定的错误代码退出
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
