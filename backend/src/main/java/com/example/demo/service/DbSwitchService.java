package com.example.demo.service;

import com.example.demo.config.MutableDataSource;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;

@Service
public class DbSwitchService {
    private final MutableDataSource mutable;
    private final DataSource defaultDs;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    public DbSwitchService(MutableDataSource mutable,
                           @Value("${spring.datasource.url}") String url,
                           @Value("${spring.datasource.username}") String user,
                           @Value("${spring.datasource.password}") String pass) {
        this.mutable = mutable;
        HikariDataSource base = new HikariDataSource();
        base.setJdbcUrl(url);
        base.setUsername(user);
        base.setPassword(pass);
        base.setMaximumPoolSize(10);
        this.defaultDs = base;
    }

    public void switchToUser(String usuarioBd, String claveBd) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(dbUrl);
        ds.setUsername(usuarioBd);
        ds.setPassword(claveBd);
        ds.setMaximumPoolSize(5); // Pool pequeño por cada usuario conectado
        mutable.switchTo(ds);
        System.out.println("🔄 Switched to DB User: " + usuarioBd);
    }

    public void resetToDefault() {
        mutable.switchTo(defaultDs);
        System.out.println("⏪ Connection reset to system default");
    }
}