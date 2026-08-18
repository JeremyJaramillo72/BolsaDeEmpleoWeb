package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class AdminDataSourceConfig {

    @Bean("adminDataSource")
    public DataSource adminDataSource(DataSource dataSource) {
        return dataSource;
    }

    @Bean("adminJdbcTemplate")
    public JdbcTemplate adminJdbcTemplate(
            @Qualifier("adminDataSource") DataSource adminDataSource) {
        return new JdbcTemplate(adminDataSource);
    }
}