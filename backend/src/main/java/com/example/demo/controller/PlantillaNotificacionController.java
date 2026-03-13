package com.example.demo.controller;

import com.example.demo.dto.PlantillaNotificacionDTO;
import com.example.demo.service.PlantillaNotificacionService;
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
@RequestMapping("/api/plantillas")
@RequiredArgsConstructor
public class PlantillaNotificacionController {

    private final PlantillaNotificacionService plantillaService;
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
     * Obtener todas las plantillas
     */
    @GetMapping
    public ResponseEntity<?> obtenerPlantillas(HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

            List<PlantillaNotificacionDTO> plantillas = plantillaService.obtenerPlantillas();
            return ResponseEntity.ok(plantillas);
        } catch (Exception e) {
            log.error("Error obteniendo plantillas: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtener plantilla por tipo
     */
    @GetMapping("/{tipo}")
    public ResponseEntity<?> obtenerPlantilla(@PathVariable String tipo, HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

            PlantillaNotificacionDTO plantilla = plantillaService.obtenerPlantilla(tipo);
            return ResponseEntity.ok(plantilla);
        } catch (RuntimeException e) {
            log.error("Plantilla no encontrada: " + tipo);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error obteniendo plantilla: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Actualizar plantilla
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPlantilla(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

            String titulo = payload.get("titulo");
            String contenido = payload.get("contenido");

            if (titulo == null || titulo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("exito", false, "mensaje", "El título no puede estar vacío")
                );
            }

            if (contenido == null || contenido.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("exito", false, "mensaje", "El contenido no puede estar vacío")
                );
            }

            plantillaService.actualizarPlantilla(id, titulo, contenido);

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "✅ Plantilla actualizada exitosamente"
            ));

        } catch (RuntimeException e) {
            log.error("Error actualizando plantilla: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("exito", false, "mensaje", "❌ " + e.getMessage())
            );
        } catch (Exception e) {
            log.error("Error actualizando plantilla: " + e.getMessage());
            return ResponseEntity.internalServerError().body(
                    Map.of("exito", false, "mensaje", "❌ Error al actualizar plantilla")
            );
        }
    }

    /**
     * Obtener historial de cambios
     */
    @GetMapping("/{id}/historial")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Integer id, HttpSession session) {
        try {
            // Validar administrador
            ResponseEntity<?> validacion = validarAdministrador(session);
            if (validacion != null) return validacion;

            List<PlantillaNotificacionDTO.HistorialItem> historial = plantillaService.obtenerHistorial(id);
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            log.error("Error obteniendo historial: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }

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
