package com.example.deeptalk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class RequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludeHeaders(true); // 注意：仅用于排查，请勿在生产长期开启，可能包含敏感信息
        loggingFilter.setIncludePayload(false); // multipart 不记录内容，以免过大
        loggingFilter.setMaxPayloadLength(0);
        loggingFilter.setAfterMessagePrefix("[REQ] ");
        loggingFilter.setBeforeMessagePrefix("[REQ] ");
        return loggingFilter;
    }
}
