package com.example.demo.controller;

import com.example.demo.service.IUsuarioIdiomaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil-idioma")
@CrossOrigin(origins = "*")
public class UsuarioIdiomaController {

    @Autowired
    private IUsuarioIdiomaService idiomaService; // 👈 Inyectamos la Interfaz, no la Impl

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idIdioma") Integer idIdioma,
            @RequestParam("nivel") String nivel,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            @RequestParam(value = "codigoCertificado", required = false) String codigo) {

        try {
            idiomaService.registrarIdiomaConCertificado(idUsuario, idIdioma, nivel, archivo, codigo);
            return ResponseEntity.ok(Map.of("mensaje", "Idioma registrado con éxito por el Procedure"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}