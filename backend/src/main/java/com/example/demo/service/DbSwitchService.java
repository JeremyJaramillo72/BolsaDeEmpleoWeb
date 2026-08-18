package com.example.demo.service;

import com.example.demo.config.MutableDataSource;
import org.springframework.stereotype.Service;

@Service
public class DbSwitchService {
    private final MutableDataSource mutable;

    public DbSwitchService(MutableDataSource mutable) {
        this.mutable = mutable;
    }

    public void switchToUser(String usuarioBd, String claveBd) {
        // No-op en Supabase: usa conexion unica centralizada
    }

    public void resetToDefault() {
        // No-op en Supabase: mantiene conexion fija
    }
}