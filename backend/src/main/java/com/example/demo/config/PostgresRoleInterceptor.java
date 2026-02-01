package com.example.demo.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class PostgresRoleInterceptor implements HandlerInterceptor {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. Obtenemos el usuario autenticado desde Spring Security
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String username = auth.getName();
            try {
                // 2. Cambiamos el rol de la sesión actual en PostgreSQL
                jdbcTemplate.execute(String.format("SET ROLE \"%s\"", username));
            } catch (Exception e) {
                // Si el usuario no existe en la BD física aún, podrías registrar el error
                System.out.println("No se pudo establecer el rol: " + e.getMessage());
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 3. ¡IMPORTANTE! Limpiamos el rol al terminar la petición
        // Esto evita que la conexión regrese al pool con el nombre del usuario anterior
        jdbcTemplate.execute("RESET ROLE");
    }
}