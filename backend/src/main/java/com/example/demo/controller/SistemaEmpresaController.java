package com.example.demo.controller;

import com.example.demo.dto.SistemaEmpresaDTO;
import com.example.demo.service.SistemaEmpresaService;
import com.example.demo.service.Impl.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/configuracion-sistema")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SistemaEmpresaController {

    private final SistemaEmpresaService service;
    private final CloudinaryService     cloudinaryService;

    // ── GET /api/configuracion-sistema ────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> obtener() {
        try {
            return ResponseEntity.ok(service.obtenerConfiguracion());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/configuracion-sistema ────────────────────────────────────
    @PutMapping
    public ResponseEntity<?> actualizar(@RequestBody SistemaEmpresaDTO dto) {
        try {
            if (dto.getNombreAplicativo() == null || dto.getNombreAplicativo().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre del aplicativo es obligatorio"));
            }
            return ResponseEntity.ok(service.actualizarConfiguracion(dto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/configuracion-sistema/logo ──────────────────────────────
    // Igual que PerfilEmpresaController.actualizarLogoEmpresa():
    //   1. CloudinaryService sube el archivo y devuelve la URL segura
    //   2. Se guarda la URL en seguridad.sistema_empresa vía SP JSONB
    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarLogo(@RequestParam("archivo") MultipartFile archivo) {
        try {
            // Misma llamada que en PerfilEmpresaController
            String urlSegura = cloudinaryService.subirImagenEArchivo(archivo);

            System.out.println("Logo sistema subido. URL: " + urlSegura);

            // Guarda la URL en BD vía SP JSONB
            service.actualizarLogoUrl(urlSegura);

            // Devolver URL + config actualizada para que Angular actualice el localStorage
            SistemaEmpresaDTO cfg = service.obtenerConfiguracion();
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Logo actualizado correctamente",
                    "logoUrl", urlSegura,
                    "config",  cfg
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al subir la imagen: " + e.getMessage()));
        }
    }
}