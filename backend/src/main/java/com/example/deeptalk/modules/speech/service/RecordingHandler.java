package com.example.deeptalk.modules.speech.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component // 将其声明为Spring组件，方便注入和管理
@Slf4j
public class RecordingHandler {

    // 定义存放录音文件的根目录
    private final Path artifactBasePath = Paths.get("deploy", "artifact");

    /**
     * 记录一个音频数据块。
     * 它会负责创建目录并将数据追加到用户的临时文件中。
     * @param sessionId 当前的会话ID
     * @param userId 发送数据的用户ID
     * @param audioData 音频数据
     */
    public void recordAudioChunk(String sessionId, String userId, byte[] audioData) {
        try {
            // 拼接出当前会话的目录路径
            Path sessionPath = artifactBasePath.resolve(sessionId);
            // 如果目录不存在，则创建它
            Files.createDirectories(sessionPath);

            // 定义用户的临时录音文件路径
            Path tempFilePath = sessionPath.resolve(userId + ".tmp");
            // 使用追加模式将数据写入文件
            try (OutputStream os = new FileOutputStream(tempFilePath.toFile(), true)) {
                os.write(audioData);
            }
        } catch (IOException e) {
            log.error("[RecordingHandler] 为用户 {} 在会话 {} 中写入音频数据失败: {}", userId, sessionId, e.getMessage());
        }
    }

    /**
     * 在会话结束时，将该会话的所有临时录音文件（.tmp）重命名为最终的MP4文件。
     * @param sessionId 需要处理的会话ID
     */
    public void finalizeSessionRecordings(String sessionId) {
        Path sessionPath = artifactBasePath.resolve(sessionId);
        if (!Files.exists(sessionPath)) {
            log.warn("[RecordingHandler] 找不到会话 {} 的录音目录，无需进行最终化处理。", sessionId);
            return;
        }

        log.info("[RecordingHandler] 正在为会话 {} 进行录音文件最终化处理...", sessionId);
        try (var stream = Files.list(sessionPath)) {
            stream.filter(path -> path.toString().endsWith(".tmp"))
                    .forEach(tempFile -> {
                        try {
                            String tempFileName = tempFile.getFileName().toString();
                            // 从 "someUserId.tmp" 中提取出 "someUserId"
                            String baseName = tempFileName.substring(0, tempFileName.lastIndexOf('.'));
                            // 格式化成最终文件名: "[用户ID]-[会话ID].mp4"
                            String finalFileName = String.format("%s-%s.mp4", baseName, sessionId);
                            Path finalPath = sessionPath.resolve(finalFileName);

                            Files.move(tempFile, finalPath);
                            log.info("[RecordingHandler] 已完成录音文件: {}", finalPath);
                        } catch (IOException e) {
                            log.error("[RecordingHandler] 最终化处理文件 {} 失败: {}", tempFile, e.getMessage());
                        }
                    });
        } catch (IOException e) {
            log.error("[RecordingHandler] 访问会话 {} 的录音目录失败: {}", sessionId, e.getMessage());
        }
    }
}