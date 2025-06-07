#!/bin/bash

# --- 配置信息 ---
NUM_USERS=100
API_URL_CONNECT="http://localhost:8080/api/speech/connect"
API_URL_DISCONNECT="http://localhost:8080/api/speech/disconnect"

# --- 初始化数组来存储每个用户的信息 ---
# Bash 4+ 支持关联数组，但为了更好的兼容性，我们使用索引数组
declare -a user_ids
declare -a connect_pids
declare -a connect_out_files
declare -a connect_err_files
declare -a connect_statuses
declare -a sids

# --- 确保脚本退出时清理所有临时文件 ---
# 使用 'trap' 命令，无论脚本如何退出，都会执行清理
cleanup() {
    echo "正在清理所有临时文件..."
    # 使用 "{@}" 语法来获取数组的所有元素
    rm -f "${connect_out_files[@]}" "${connect_err_files[@]}" 2>/dev/null
    echo "清理完毕。"
}
trap cleanup EXIT

# =================================================================
# 阶段 1: 并发建立 100 个连接
# =================================================================
echo "### 阶段 1: 开始并发建立 $NUM_USERS 个连接 ###"
echo "----------------------------------------------------"

for i in $(seq 1 $NUM_USERS)
do
    # 生成随机用户名并存储
    user_ids[$i]="user_$(date +%s%N | sha256sum | base64 | head -c 10)"

    # 为每个连接创建临时文件来存储输出
    connect_out_files[$i]=$(mktemp)
    connect_err_files[$i]=$(mktemp)

    # 在后台启动 curl 连接命令
    echo "($i/$NUM_USERS) 正在为用户 '${user_ids[$i]}' 发起连接..."
    curl -s -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"${user_ids[$i]}\", \"sessionId\": \"null\"}" \
         "$API_URL_CONNECT" > "${connect_out_files[$i]}" 2> "${connect_err_files[$i]}" &
    
    # 存储后台进程的PID
    connect_pids[$i]=$!
done

echo ""
echo "所有 $NUM_USERS 个连接请求已在后台发出。正在等待所有连接完成..."
echo "----------------------------------------------------"


# =================================================================
# 统一检查所有连接的状态
# =================================================================
all_connections_ok=true
failed_connections_count=0

for i in $(seq 1 $NUM_USERS)
do
    # 等待指定的PID完成，并获取其退出状态码
    wait ${connect_pids[$i]}
    status=$?
    connect_statuses[$i]=$status

    # 读取返回的 SID
    sids[$i]=$(cat "${connect_out_files[$i]}")

    if [ $status -ne 0 ]; then
        all_connections_ok=false
        failed_connections_count=$((failed_connections_count + 1))
        echo "❌ ($i/$NUM_USERS) 连接失败! 用户: ${user_ids[$i]}, 状态码: $status"
    else
        echo "✅ ($i/$NUM_USERS) 连接成功。用户: ${user_ids[$i]}, SID: ${sids[$i]}"
    fi
done

echo "----------------------------------------------------"
echo "所有连接尝试均已完成。正在检查结果..."


# =================================================================
# 决策点: 根据连接结果决定是否继续
# =================================================================
if ! $all_connections_ok; then
    echo ""
    echo "❌ 严重错误: 在 $NUM_USERS 个连接中有 $failed_connections_count 个连接失败。"
    echo "脚本将中止，不会执行任何断开连接的操作。"
    echo "你可以检查上面列出的失败连接的详细信息。"
    # 如果需要查看具体的错误日志，可以取消下面这行的注释
    # for i in $(seq 1 $NUM_USERS); do if [ ${connect_statuses[$i]} -ne 0 ]; then echo "--- 错误日志 for ${user_ids[$i]} ---"; cat "${connect_err_files[$i]}"; fi; done
    exit 1
fi


# =================================================================
# 阶段 2: 并发断开 100 个连接
# =================================================================
echo ""
echo "✅ 所有 $NUM_USERS 个连接均已成功建立！"
echo ""
echo "### 阶段 2: 开始并发断开所有 $NUM_USERS 个连接 ###"
echo "----------------------------------------------------"

for i in $(seq 1 $NUM_USERS)
do
    # 在后台启动 curl 断开连接命令
    echo "($i/$NUM_USERS) 正在为用户 '${user_ids[$i]}' 发起断开连接..."
    curl -s -v -X POST -H "Content-Type: application/json" \
         -d "{\"userId\": \"${user_ids[$i]}\", \"sessionId\": \"${sids[$i]}\"}" \
         "$API_URL_DISCONNECT" > /dev/null 2>&1 &
done

echo ""
echo "所有 $NUM_USERS 个断开连接请求已在后台发出。等待所有操作完成..."

# 等待所有后台子进程（即所有断开连接的curl命令）完成
wait

echo "----------------------------------------------------"
echo "🎉🎉🎉 所有 $NUM_USERS 个用户已成功断开连接！"
echo "脚本执行完毕。"