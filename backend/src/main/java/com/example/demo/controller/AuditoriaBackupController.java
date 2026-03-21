package com.example.demo.controller;

import com.example.demo.dto.ResumenBackupDTO;
import com.example.demo.dto.DetalleBackupDTO;
import com.example.demo.service.AuditoriaBackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auditoria/respaldos")
@CrossOrigin(origins = "*") // Pilas: ajusta esto con tus reglas de CORS
public class AuditoriaBackupController {

    @Autowired
    private AuditoriaBackupService auditoriaService;

    @GetMapping("/resumen")
    public ResponseEntity<List<ResumenBackupDTO>> getResumen() {
        // Mandamos un Map vacío para que la función SQL use sus valores por defecto
        return ResponseEntity.ok(auditoriaService.obtenerResumen(new HashMap<>()));
    }

    @GetMapping("/detalle")
    public ResponseEntity<List<DetalleBackupDTO>> getDetalle(@RequestParam("id_usuario") Long idUsuario) {
        // Creamos el Map que espera el Service a partir del parámetro de la URL
        Map<String, Object> parametros = new HashMap<>();
        parametros.put("id_usuario", idUsuario);
        return ResponseEntity.ok(auditoriaService.obtenerDetalle(parametros));
    }
}