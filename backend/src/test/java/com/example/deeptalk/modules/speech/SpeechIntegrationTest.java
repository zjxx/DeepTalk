package com.example.deeptalk.modules.speech;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class SpeechIntegrationTest {

    @LocalServerPort
    private int port;

    @Value("${test.wsl.bash}")
    private String wslBash;

    @Value("${test.scripts.dir}")
    private String testScriptsDir;

    @Value("${test.timeout.seconds}")
    private int timeoutSeconds;

    @Autowired
    private WslEnvironmentChecker wslEnvironmentChecker;

    private Path scriptsPath;

    @BeforeEach
    void setUp() {
        // 获取项目根目录（backend的父目录）
        String projectRoot = Paths.get(System.getProperty("user.dir")).getParent().toString();
        // 构建完整的脚本目录路径
        scriptsPath = Paths.get(projectRoot, testScriptsDir);
        
        // 确保测试脚本目录存在
        assertTrue(Files.exists(scriptsPath), "测试脚本目录不存在: " + scriptsPath);
        
        // 检查所有必需的脚本文件是否存在
        String[] requiredScripts = {
            "stress-connect.sh",
            "test-connect-conflict.sh",
            "test-connect-custom.sh",
            "test-connect-single.sh",
            "test-connect.sh",
            "test-multiple-connect.sh"
        };
        
        for (String script : requiredScripts) {
            Path scriptPath = scriptsPath.resolve(script);
            assertTrue(Files.exists(scriptPath), "脚本文件不存在: " + scriptPath);
        }
        
        // 确保所有脚本都有执行权限
        try {
            // 将Windows路径转换为WSL路径格式
            String wslPath = convertToWslPath(scriptsPath.toString());
            // 使用cd命令切换到脚本目录，然后执行chmod
            String command = wslBash + " -c 'cd " + wslPath + " && chmod +x *.sh'";
            Process process = Runtime.getRuntime().exec(command);
            process.waitFor(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            throw new RuntimeException("无法设置脚本执行权限", e);
        }
    }

    @Test
    void testStressConnect() throws Exception {
        runBashScript("stress-connect.sh");
    }

    @Test
    void testConnectConflict() throws Exception {
        runBashScript("test-connect-conflict.sh");
    }

    @Test
    void testConnectCustom() throws Exception {
        runBashScript("test-connect-custom.sh user1 user2");
    }

    @Test
    void testConnectSingle() throws Exception {
        runBashScript("test-connect-single.sh");
    }

    @Test
    void testConnect() throws Exception {
        runBashScript("test-connect.sh");
    }

    @Test
    void testMultipleConnect() throws Exception {
        runBashScript("test-multiple-connect.sh");
    }

    private void runBashScript(String scriptName) throws Exception {
        // 构建完整的脚本路径
        Path scriptPath = scriptsPath.resolve(scriptName);
        assertTrue(Files.exists(scriptPath), "脚本文件不存在: " + scriptPath);

        // 将Windows路径转换为WSL路径格式
        String wslPath = convertToWslPath(scriptsPath.toString());
        String scriptWslPath = convertToWslPath(scriptPath.toString());
        
        // 构建命令：先切换到脚本目录，然后执行脚本
        String command = wslBash + " -c 'cd " + wslPath + " && ./" + scriptName + "'";
        
        // 执行命令
        Process process = Runtime.getRuntime().exec(command);
        
        // 读取输出
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                System.out.println(line); // 实时打印输出
            }
        }

        // 读取错误
        StringBuilder error = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                error.append(line).append("\n");
                System.err.println(line); // 实时打印错误
            }
        }

        // 等待进程完成，设置超时时间
        boolean completed = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!completed) {
            process.destroyForcibly();
            throw new RuntimeException("脚本执行超时: " + scriptName);
        }

        // 检查退出码
        int exitCode = process.exitValue();
        assertEquals(0, exitCode, "脚本执行失败: " + scriptName + 
            "\n输出: " + output.toString() + 
            "\n错误: " + error.toString());
    }

    /**
     * 将Windows路径转换为WSL路径格式
     * 例如：D:\projects\DeepTalk -> /mnt/d/projects/DeepTalk
     */
    private String convertToWslPath(String windowsPath) {
        // 获取驱动器号（小写）
        String driveLetter = windowsPath.substring(0, 1).toLowerCase();
        // 移除驱动器号和冒号
        String path = windowsPath.substring(2);
        // 将反斜杠替换为正斜杠
        path = path.replace("\\", "/");
        // 添加/mnt前缀和驱动器号
        return "/mnt/" + driveLetter + path;
    }
} 