package com.example.deeptalk.modules.community.service;

import com.qiniu.common.QiniuException;
import com.qiniu.http.Response;
import com.qiniu.storage.Configuration;
import com.qiniu.storage.Region;
import com.qiniu.storage.UploadManager;
import com.qiniu.util.Auth;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QiniuStorageService {

    @Value("${qiniu.accessKey}")
    private String accessKey;

    @Value("${qiniu.secretKey}")
    private String secretKey;

    @Value("${qiniu.bucket}")
    private String bucket;

    @Value("${qiniu.domain}")
    private String domain;

    @Value("${qiniu.uploadRegion:auto}")
    private String uploadRegion;

    private Region parseRegion(String regionCode) {
        if (regionCode == null) return Region.autoRegion();
        switch (regionCode) {
            case "z0": return Region.huadong();
            case "z1": return Region.huabei();
            case "z2": return Region.huanan();
            case "na0": return Region.beimei();
            case "as0": return Region.xinjiapo();
            default: return Region.autoRegion();
        }
    }

    public String uploadImage(MultipartFile file, String keyPrefix) throws IOException {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')) : "";
        String key = String.format("%s/%s%s", keyPrefix, UUID.randomUUID(), ext);

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IOException("图片过大，最大5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
            throw new IOException("不支持的图片格式");
        }

        // 使用自动区域识别，避免区域/上传域名不匹配
        Configuration cfg = new Configuration(Region.autoRegion());
        UploadManager uploadManager = new UploadManager(cfg);
        Auth auth = Auth.create(accessKey, secretKey);
        String upToken = auth.uploadToken(bucket);
        log.info("[Qiniu] upload start, bucket={}, region={}, key={}", bucket, uploadRegion, key);
        try {
            Response response = uploadManager.put(file.getBytes(), key, upToken);
            if (response.isOK()) {
                String url = domain.endsWith("/") ? domain + key : domain + "/" + key;
                log.info("[Qiniu] upload success, url={}, reqId={}", url, response.reqId);
                return url;
            } else {
                String body = response.bodyString();
                log.error("[Qiniu] upload failed, code={}, reqId={}, body={}", response.statusCode, response.reqId, body);
                if (response.statusCode == 631) {
                    log.error("[Qiniu] 提示: 631 no such bucket。请确认 bucket 名称是否存在且归属于当前 AK/SK 账号，并与区域匹配（当前配置uploadRegion={}）。", uploadRegion);
                }
                throw new IOException("七牛上传失败: " + body);
            }
        } catch (QiniuException ex) {
            Response r = ex.response;
            String body = null;
            try { body = r != null ? r.bodyString() : null; } catch (Exception ignore) {}
            log.error("[Qiniu] exception, code={}, reqId={}, body={}, msg={}", r != null ? r.statusCode : null, r != null ? r.reqId : null, body, ex.getMessage());
            if (r != null && r.statusCode == 631) {
                log.error("[Qiniu] 提示: 631 no such bucket。请在控制台创建对应空间或更改application.yml中的qiniu.bucket为实际空间名；并校对区域（z0/z1/z2/na0/as0或auto）。");
            }
            throw new IOException("七牛上传异常: " + ex.getMessage());
        }
    }
}
