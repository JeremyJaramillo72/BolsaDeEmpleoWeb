package com.example.demo.controller;

import com.example.demo.dto.NotificacionDTO;
import com.example.demo.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;


    @PatchMapping("/{idNotificacion}/leida")
    public ResponseEntity<Void> marcarLeida(@PathVariable Integer idNotificacion) {
        notificacionService.marcarComoLeida(idNotificacion);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/usuario/{idUsuario}/marcar-todas")
    public ResponseEntity<Void> marcarTodasLeidas(@PathVariable Long idUsuario) {
        notificacionService.marcarTodasLeidas(idUsuario);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<NotificacionDTO>> obtenerMisNotificaciones(@PathVariable Long idUsuario) {
        try {
            try {
                notificacionService.verificarYNotificarOfertasPendientes(idUsuario);
            } catch (Exception e) {
                log.warn("Error verificando ofertas pendientes: {}", e.getMessage());
            }

            // AGREGAR ESTO - faltaba completamente:
            try {
                notificacionService.verificarYNotificarEmpresasPendientes(idUsuario);
            } catch (Exception e) {
                log.warn("Error verificando empresas pendientes: {}", e.getMessage());
            }

            log.info("Consultando notificaciones para usuario: {}", idUsuario);
            List<NotificacionDTO> notificaciones = notificacionService.obtenerNotificacionesUsuario(idUsuario);
            log.info("Notificaciones encontradas: {}", notificaciones.size());
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            log.error("ERROR obteniendo notificaciones para usuario {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }
}
