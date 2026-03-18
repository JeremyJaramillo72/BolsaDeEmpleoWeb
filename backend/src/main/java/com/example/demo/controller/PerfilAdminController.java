package com.example.demo.controller;

import com.example.demo.dto.PerfilAdminDTO;
import com.example.demo.service.PerfilAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil-admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PerfilAdminController {

    private final PerfilAdminService service;

    // ── GET /api/perfil-admin/{idUsuario} ─────────────────────────────────
    // También usado por GET /api/auth/foto-perfil/{id} que ya existe.
    // Este endpoint devuelve el perfil completo para el componente.
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> obtener(@PathVariable Long idUsuario) {
        try {
            return ResponseEntity.ok(service.obtenerPerfil(idUsuario));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/perfil-admin/{idUsuario} ─────────────────────────────────
    // Actualiza nombre, apellido, telefono, genero, fecha_nacimiento.
    // Correo NO se toca — solo lectura.
    @PutMapping("/{idUsuario}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long idUsuario,
            @RequestBody  PerfilAdminDTO dto) {
        try {
            if (dto.getNombre() == null || dto.getNombre().isBlank())
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre es obligatorio"));
            return ResponseEntity.ok(service.actualizarPerfil(idUsuario, dto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/perfil-admin/{idUsuario}/foto ───────────────────────────
    // Mismo patrón que PerfilEmpresaController:
    //   CloudinaryService sube el archivo → URL → sp_guardar_url_imagen
    @PostMapping(value = "/{idUsuario}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarFoto(
            @PathVariable Long idUsuario,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            PerfilAdminDTO resultado = service.actualizarFoto(idUsuario, archivo);
            return ResponseEntity.ok(Map.of(
                    "mensaje",   "Foto actualizada correctamente",
                    "urlImagen", resultado.getUrlImagen() != null ? resultado.getUrlImagen() : "",
                    "perfil",    resultado
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al subir la foto: " + e.getMessage()));
        }
    }
}