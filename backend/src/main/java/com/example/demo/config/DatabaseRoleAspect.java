package com.example.demo.config;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.After;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class DatabaseRoleAspect {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Definimos que se ejecute antes de cualquier método en tus repositorios
    @Before("execution(* com.example.demo.repository.*.*(..))")
    public void setPostgresRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String username = auth.getName();
            try {
                // Forzamos el rol en la conexión actual que usará Hibernate
                jdbcTemplate.execute(String.format("SET ROLE \"%s\"", username));
                System.out.println("--- AOP: Rol establecido a " + username + " ---");
            } catch (Exception e) {
                System.err.println("--- AOP Error: No se pudo setear el rol: " + e.getMessage());
            }
        }
    }

    // 2. Limpiamos la conexión después de la consulta para no contaminar el pool
    @After("execution(* com.example.demo.repository.*.*(..))")
    public void resetPostgresRole() {
        try {
            jdbcTemplate.execute("RESET ROLE");
        } catch (Exception e) {
            // Silencioso si falla el reset
        }
    }
}