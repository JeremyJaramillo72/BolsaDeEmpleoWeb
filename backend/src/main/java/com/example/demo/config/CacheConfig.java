package com.example.demo.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${dashboard.cache.ttl-minutes:3}")
    private int dashboardTtlMinutes;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                "dashboardAdmin",
                "dashboardEmpresa",
                "dashboardPostulante"
        );
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(dashboardTtlMinutes, TimeUnit.MINUTES)
                .maximumSize(100)
                .recordStats());
        return manager;
    }
}
