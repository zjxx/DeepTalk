package com.example.deeptalk.modules.speech;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
public class WslEnvironmentChecker {

    @PostConstruct
    public void checkWslEnvironment() {
        try {
            // 检查WSL是否可用
            Process process = Runtime.getRuntime().exec("wsl --status");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String output = reader.readLine();
            
            if (process.waitFor() != 0 || !StringUtils.hasText(output)) {
                throw new RuntimeException("WSL环境不可用，请确保已安装并启用WSL");
            }
            
            // 检查bash是否可用
            process = Runtime.getRuntime().exec("wsl bash --version");
            if (process.waitFor() != 0) {
                throw new RuntimeException("WSL中的bash不可用，请确保WSL环境正确配置");
            }
            
            System.out.println("WSL环境检查通过");
        } catch (Exception e) {
            throw new RuntimeException("WSL环境检查失败: " + e.getMessage(), e);
        }
    }
} 