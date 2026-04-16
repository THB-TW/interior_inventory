package com.manage.interior_inventory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 網頁相關設定 (例如 CORS)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 設定全域的 CORS (跨來源資源共用) 規則
     * 讓未來前端 (例如 Vue / React 預設可能是 http://localhost:5173) 可以順利呼叫後端 API，而不會被瀏覽器同源政策擋下。
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 套用到所有的 API 路徑
                // 這裡使用 allowedOriginPatterns("*") 允許所有來源。
                // 若正式上線，建議改成 .allowedOrigins("http://localhost:5173", "https://你的前端網址.com") 比較安全
                .allowedOriginPatterns("*") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // 允許的 HTTP 方法
                .allowedHeaders("*") // 允許所有 Request Header (例如 Authorization Token 等)
                .allowCredentials(true) // 允許跨域發送 Cookie
                .maxAge(3600); // Preflight (OPTIONS 預檢請求) 的快取時間，單位為秒，這裡設定為 1 小時
    }
}
