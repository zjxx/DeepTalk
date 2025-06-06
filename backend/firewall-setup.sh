#!/bin/bash

# 等待网络服务完全启动
sleep 10

# 添加防火墙规则
nft add rule inet firewalld filter_IN_public_allow tcp dport 443 ct state { new, untracked } accept
nft add rule inet firewalld filter_IN_public_allow tcp dport 8765 ct state { new, untracked } accept
# 记录执行状态
if [ $? -eq 0 ]; then
    echo "$(date): 防火墙规则添加成功" >> /var/log/firewall-setup.log
else
    echo "$(date): 防火墙规则添加失败" >> /var/log/firewall-setup.log
fi 