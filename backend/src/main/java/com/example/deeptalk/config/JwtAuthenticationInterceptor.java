package com.example.deeptalk.config;

import com.example.deeptalk.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private SecretKey jwtSecretKey;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 放行OPTIONS请求
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }        String uri = request.getRequestURI();
        String method = request.getMethod();
        String authHeader = request.getHeader("Authorization");
        boolean hasAuth = authHeader != null && authHeader.startsWith("Bearer ");
        log.debug("[JWT] preHandle uri={}, method={}, hasAuth={}", uri, method, hasAuth);

        if (!hasAuth) {
            // 无token时，对于某些需要认证的接口返回未授权
            // 但对于查询类接口（GET）可以放行
            if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) {
                // 写操作需要登录
                log.warn("[JWT] 需要登录才能执行此操作, uri={}, method={}", uri, method);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"需要登录\",\"code\":\"UNAUTHORIZED\"}");
                return false;
            }
            // GET请求放行
            return true;
        }

        String token = authHeader.replace("Bearer ", "");

        // 检查token是否在黑名单中
        if (tokenBlacklistService.isBlacklisted(token)) {
            log.warn("[JWT] token in blacklist, uri={}", uri);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token已被注销");
            return false;
        }        try {
            // 验证token
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecretKey)
                    .parseClaimsJws(token)
                    .getBody();

            // 将用户信息添加到请求属性中
            // 统一转换为String类型，避免类型转换错误
            Object userIdObj = claims.get("userId");
            String userId = userIdObj != null ? String.valueOf(userIdObj) : null;
            
            request.setAttribute("userId", userId);
            request.setAttribute("username", claims.get("username"));
            request.setAttribute("email", claims.getSubject());

            log.debug("[JWT] valid token for userId={}, uri={}", userId, uri);
            return true;
        } catch (Exception e) {
            log.warn("[JWT] invalid token, uri={}, reason={}", uri, e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("无效的Token");
            return false;
        }
    }
}