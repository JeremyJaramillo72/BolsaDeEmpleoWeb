package com.example.demo.controller;

import com.example.demo.dto.ConfiguracionCorreoDTO;
import com.example.demo.service.ConfiguracionCorreoService;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.model.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/configuracion/correo")
@RequiredArgsConstructor
public class ConfiguracionCorreoController {

    private final ConfiguracionCorreoService configuracionService;
    private final UsuarioRepository usuarioRepository;

    /**
     * Validar que el usuario sea administrador
     */
    private ResponseEntity<?> validarAdministrador(HttpSession session) {
        Long idUsuario = (Long) session.getAttribute("idUsuario");
        if (idUsuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "No estás autenticado"));
        }

        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        if (usuario.isEmpty() || usuario.get().getRol() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Usuario no encontrado"));
        }

        String nombreRol = usuario.get().getRol().getNombreRol();
        if (!"Administrador".equalsIgnoreCase(nombreRol)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Solo administradores pueden acceder"));
        }

        return null; // Validación exitosa
    }

    /**
     * Obtener configuración actual de correo
     */
    @GetMapping
    public ResponseEntity<?> obtenerConfiguracion(HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

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
    public ResponseEntity<?> probarCorreo(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

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
    public ResponseEntity<?> actualizarSmtp(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request,
            HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

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
    public ResponseEntity<?> obtenerHistorial(HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

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
