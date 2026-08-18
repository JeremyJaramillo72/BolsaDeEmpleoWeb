package com.example.demo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {
    @Value("${spring.datasource.url}")
    private String url;
    @Value("${spring.datasource.username}")
    private String username;
    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    @Primary
    public MutableDataSource dataSource() {
        HikariDataSource base = new HikariDataSource();
        base.setJdbcUrl(url);
        base.setUsername(username);
        base.setPassword(password);
        base.setMaximumPoolSize(10);
        base.setMinimumIdle(10);
        base.setIdleTimeout(600000);
        base.setMaxLifetime(1800000);
        base.setConnectionTimeout(10000);
        base.setPoolName("PrimaryHikariPool");
        return new MutableDataSource(base);
    }
}