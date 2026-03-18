package com.example.demo.controller;

import com.example.demo.dto.UsuarioTablaDTO;
import com.example.demo.service.IUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/GestionUser")
@RequiredArgsConstructor
public class GestionUserController {
    private final IUsuarioService usuarioService;

    @GetMapping("/tabla")
    public ResponseEntity<List<UsuarioTablaDTO>> obtenerTablaUsuarios() {
        try {
            List<UsuarioTablaDTO> usuarios = usuarioService.obtenerUsuariosGenerales();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==========================================
    // 2. CAMBIAR ESTADO DEL USUARIO
    // ==========================================
    @PutMapping("/{id}/estado")
    public ResponseEntity<String> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestParam String estado) {
        try {
            // Tu servicio retorna void y maneja las notificaciones automáticamente
            usuarioService.cambiarEstadoUsuario(id, estado);
            return ResponseEntity.ok("Estado actualizado correctamente a " + estado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor: " + e.getMessage());
        }
    }
}