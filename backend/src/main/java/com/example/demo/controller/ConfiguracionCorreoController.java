package com.example.demo.controller;

import com.example.demo.dto.ConfiguracionCorreoDTO;
import com.example.demo.service.ConfiguracionCorreoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/configuracion/correo")
@RequiredArgsConstructor
public class ConfiguracionCorreoController {

    private final ConfiguracionCorreoService configuracionService;

    /**
     * Obtener configuración actual de correo
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<ConfiguracionCorreoDTO> obtenerConfiguracion() {
        try {
            ConfiguracionCorreoDTO config = configuracionService.obtenerConfiguracion();
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("Error obteniendo configuración: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Probar correo antes de guardar
     */
    @PostMapping("/probar")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> probarCorreo(
            @RequestBody Map<String, String> payload) {
        try {
            String correoNuevo = payload.get("correo");

            if (correoNuevo == null || correoNuevo.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("exito", false);
                error.put("mensaje", "Correo no puede estar vacío");
                return ResponseEntity.badRequest().body(error);
            }

            configuracionService.probarCorreo(correoNuevo);

            Map<String, Object> response = new HashMap<>();
            response.put("exito", true);
            response.put("mensaje", "✅ Email de prueba enviado exitosamente a: " + correoNuevo);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "❌ " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Error probando correo: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "❌ " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Actualizar configuración SMTP completa
     */
    @PutMapping("/smtp")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> actualizarSmtp(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        try {
            String correoNuevo = payload.get("valor");
            String password = payload.get("password");
            Long idUsuario = Long.valueOf(payload.getOrDefault("idUsuario", "0"));

            if (correoNuevo == null || correoNuevo.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("exito", false);
                error.put("mensaje", "Email no puede estar vacío");
                return ResponseEntity.badRequest().body(error);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("exito", false);
                error.put("mensaje", "Contraseña/Token no puede estar vacío");
                return ResponseEntity.badRequest().body(error);
            }

            if (idUsuario <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("exito", false);
                error.put("mensaje", "Usuario no válido");
                return ResponseEntity.badRequest().body(error);
            }

            ConfiguracionCorreoDTO configDTO = new ConfiguracionCorreoDTO();
            configDTO.setValor(correoNuevo);
            configDTO.setPassword(password);

            String ipAddress = getClientIpAddress(request);
            configuracionService.actualizarConfiguracionSmtp(configDTO, idUsuario, ipAddress);

            Map<String, Object> response = new HashMap<>();
            response.put("exito", true);
            response.put("mensaje", "✅ Configuración actualizada exitosamente");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "❌ " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Error actualizando configuración: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "❌ Error al actualizar: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtener historial de cambios
     */
    @GetMapping("/historial")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<ConfiguracionCorreoDTO.HistorialItem>> obtenerHistorial() {
        try {
            List<ConfiguracionCorreoDTO.HistorialItem> historial = configuracionService.obtenerHistorial();
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            log.error("Error obteniendo historial: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }

    /**
     * Obtener IP del cliente
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            String[] ips = xForwardedFor.split(",");
            return ips[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
