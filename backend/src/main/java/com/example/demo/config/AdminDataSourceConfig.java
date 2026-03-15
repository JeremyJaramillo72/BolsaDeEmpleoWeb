package com.example.demo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class AdminDataSourceConfig {

    @Bean("adminDataSource")
    public DataSource adminDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String user,
            @Value("${spring.datasource.password}") String pass) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(user);
        ds.setPassword(pass);
        ds.setMaximumPoolSize(5);
        ds.setPoolName("AdminPool");
        return ds;
    }

    @Bean("adminJdbcTemplate")
    public JdbcTemplate adminJdbcTemplate(
            @Qualifier("adminDataSource") DataSource adminDataSource) {
        return new JdbcTemplate(adminDataSource);
    }
}