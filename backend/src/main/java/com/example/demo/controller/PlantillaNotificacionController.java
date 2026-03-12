package com.example.demo.controller;

import com.example.demo.dto.PlantillaNotificacionDTO;
import com.example.demo.service.PlantillaNotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@RequestMapping("/api/plantillas")
@RequiredArgsConstructor
public class PlantillaNotificacionController {

    private final PlantillaNotificacionService plantillaService;

    /**
     * Obtener todas las plantillas
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<PlantillaNotificacionDTO>> obtenerPlantillas() {
        try {
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
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<PlantillaNotificacionDTO> obtenerPlantilla(@PathVariable String tipo) {
        try {
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
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> actualizarPlantilla(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        try {
            String titulo = payload.get("titulo");
            String contenido = payload.get("contenido");
            Long idUsuario = Long.valueOf(payload.getOrDefault("idUsuario", "0"));

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

            if (idUsuario <= 0) {
                return ResponseEntity.badRequest().body(
                        Map.of("exito", false, "mensaje", "Usuario no válido")
                );
            }

            String ipAddress = getClientIpAddress(request);
            plantillaService.actualizarPlantilla(id, titulo, contenido, idUsuario, ipAddress);

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
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<PlantillaNotificacionDTO.HistorialItem>> obtenerHistorial(@PathVariable Integer id) {
        try {
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
