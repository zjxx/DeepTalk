#!/bin/bash

# DeepTalk Starter Script.
# This should NOT be runned directly, use `systemd` instead.

# Start Kurento Media Server
docker start kurento

# Set explicit firewall rule for DeepTalk

## Frontend

nft add rule inet firewalld filter_IN_public_allow tcp dport 443 ct state { new, untracked } accept

## Kurento

nft add rule inet firewalld filter_IN_public_allow tcp dport 60000-60035 ct state { new, untracked } accept
nft add rule inet firewalld filter_IN_public_allow udp dport 60000-60035 ct state { new, untracked } accept
