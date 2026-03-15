package com.example.demo.config;
import com.example.demo.config.MutableDataSource;
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
        return new MutableDataSource(base);
    }
}