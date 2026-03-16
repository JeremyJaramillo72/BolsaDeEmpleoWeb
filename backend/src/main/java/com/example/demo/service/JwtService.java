package com.example.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // 1. GENERAR TOKEN (Ahora recibe el idSesion)
    public String generarToken(String email, String rol, Long idSesion) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .claim("idSesion", idSesion) // <-- ¡CLAVE! Guardamos el ID en el token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. EXTRAER EL EMAIL (Subject)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. EXTRAER EL ID DE SESIÓN (Lo que necesita tu Filtro)
    public Long extractIdSesion(String token) {
        final Claims claims = extractAllClaims(token);
        // Lo sacamos como Long
        Object id = claims.get("idSesion");
        if (id instanceof Integer) return ((Integer) id).longValue();
        return (Long) id;
    }

    // 4. VALIDAR SI EL TOKEN NO HA EXPIRADO
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Verifica que el email sea el mismo y que el token no haya expirado
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // Método de apoyo para verificar la expiración
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    // --- MÉTODOS INTERNOS DE APOYO ---

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}