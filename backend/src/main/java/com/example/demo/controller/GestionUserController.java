package com.example.demo.controller;

import com.example.demo.dto.ActualizarUsuarioDTO;
import com.example.demo.dto.UsuarioDetalleDTO;
import com.example.demo.dto.UsuarioTablaDTO;
import com.example.demo.service.IUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerUsuarioPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody ActualizarUsuarioDTO dto) {
        try {
            usuarioService.actualizarUsuario(id, dto);
            return ResponseEntity.ok(Map.of("mensaje", "Usuario actualizado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor: " + e.getMessage()));
        }
    }
}