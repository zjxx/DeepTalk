#!/bin/bash

# 设置基础URL
BASE_URL="http://localhost:8080/api/auth"

# 测试数据
TEST_EMAIL="213222139@seu.edu.cn"
TEST_PASSWORD="password123"
TEST_USERNAME="09022206"
VERIFICATION_CODE="682286"  # 这里需要替换为实际收到的验证码

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 辅助函数：打印测试结果
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 测试1：发送注册验证码
echo "测试1：发送注册验证码"
REGISTER_CHECK_RESPONSE=$(curl -s -X POST "$BASE_URL/register/check" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if [[ $REGISTER_CHECK_RESPONSE == *"验证码已发送"* ]]; then
    print_result 0 "注册验证码发送成功"
    echo "请查看邮箱获取验证码，并在脚本中更新 VERIFICATION_CODE 变量"
    exit 0
else
    print_result 1 "注册验证码发送失败"
    exit 1
fi

# 测试2：使用验证码完成注册
echo -e "\n测试2：使用验证码完成注册"
REGISTER_VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/register/verify" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"verificationCode\":\"$VERIFICATION_CODE\"}")

if [[ $REGISTER_VERIFY_RESPONSE == *"注册成功"* ]]; then
    print_result 0 "注册成功"
else
    print_result 1 "注册失败"
    exit 1
fi

# 测试3：正常登录
echo -e "\n测试3：正常登录"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"rememberMe\":false}")

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    print_result 0 "登录成功"
    # 提取token用于后续测试
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    print_result 1 "登录失败"
fi

# 测试4：错误密码登录
echo -e "\n测试4：错误密码登录"
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\",\"rememberMe\":false}")

if [[ $WRONG_LOGIN_RESPONSE == *"邮箱或密码错误"* ]]; then
    print_result 0 "错误密码登录测试通过"
else
    print_result 1 "错误密码登录测试失败"
fi

# 测试5：记住我功能
echo -e "\n测试5：记住我功能"
REMEMBER_ME_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"rememberMe\":true}")

if [[ $REMEMBER_ME_RESPONSE == *"token"* ]]; then
    print_result 0 "记住我功能测试通过"
    REMEMBER_ME_TOKEN=$(echo $REMEMBER_ME_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    print_result 1 "记住我功能测试失败"
fi

# 测试6：登出功能
echo -e "\n测试6：登出功能"
if [ ! -z "$TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
        -H "Authorization: Bearer $TOKEN")
    
    if [[ $LOGOUT_RESPONSE == *"登出成功"* ]]; then
        print_result 0 "登出功能测试通过"
    else
        print_result 1 "登出功能测试失败"
    fi
else
    print_result 1 "登出测试跳过 - 没有有效的token"
fi

echo -e "\n测试完成"

