package com.example.demo.config;

import com.example.demo.repository.SesionRepository;
import com.example.demo.service.JwtService; // Ajusta a tu paquete real de JwtService
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private UserDetailsService userDetailsService; // Necesario para la autenticación normal

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Si no hay token, seguimos la cadena (Spring Security decidirá si la ruta es pública o no)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(jwt);

        // --- VERIFICACIÓN DE SESIÓN EN TIEMPO REAL ---
        // Extraemos el ID de sesión del Token (debe estar en los claims)
        Long idSesionToken = jwtService.extractIdSesion(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // BUSCAMOS EN LA DB: ¿Sigue ACTIVA?
            var sesionOpt = sesionRepository.findById(idSesionToken);

            if (sesionOpt.isEmpty() || !"ACTIVA".equals(sesionOpt.get().getAccion())) {
                // Si la sesión fue "pateada" por el admin o ya se cerró
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Sesion finalizada por el administrador\"}");
                return; // Se detiene la petición aquí
            }

            // --- PROCESO NORMAL DE AUTENTICACIÓN SI LA SESIÓN ESTÁ VIVA ---
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}