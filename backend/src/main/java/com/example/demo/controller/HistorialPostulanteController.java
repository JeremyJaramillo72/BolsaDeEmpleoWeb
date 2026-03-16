package com.example.demo.controller;

import com.example.demo.dto.AuditoriaPostulanteDTO;
import com.example.demo.dto.TrazabilidadPostulanteDTO;
import com.example.demo.service.HistorialPostulanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria/postulantes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistorialPostulanteController {

    private final HistorialPostulanteService service;

    @GetMapping
    public ResponseEntity<List<AuditoriaPostulanteDTO>> obtenerResumenAuditoria() {
        return ResponseEntity.ok(service.getPostulantesAuditoria());
    }

    @GetMapping("/{idPerfil}/historial")
    public ResponseEntity<List<TrazabilidadPostulanteDTO>> obtenerHistorialPorPerfil(@PathVariable Integer idPerfil) {
        return ResponseEntity.ok(service.getHistorialByPerfil(idPerfil));
    }
}