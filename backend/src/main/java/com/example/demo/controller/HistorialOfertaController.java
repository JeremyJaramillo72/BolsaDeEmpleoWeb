package com.example.demo.controller;

import com.example.demo.dto.AuditoriaOfertaDTO;
import com.example.demo.dto.TrazabilidadOfertaDTO;
import com.example.demo.service.HistorialOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria/ofertas") // Ojo aquí: asegúrate de que cuadre con tu this.apiUrl en Angular
@CrossOrigin(origins = "*") // Ponle el origen exacto si tienes seguridad CORS activada
@RequiredArgsConstructor
public class HistorialOfertaController {

    private final HistorialOfertaService historialOfertaService;

    // 1. Endpoint para llenar la tabla principal (El Súper JOIN)
    @GetMapping
    public ResponseEntity<List<AuditoriaOfertaDTO>> obtenerResumenAuditoria() {
        List<AuditoriaOfertaDTO> listaAuditoria = historialOfertaService.getOfertasParaAuditoria();
        return ResponseEntity.ok(listaAuditoria);
    }

    // 2. Endpoint para el modal de la línea de tiempo de una oferta (Trazabilidad)
    @GetMapping("/{idOferta}/historial")
    public ResponseEntity<List<TrazabilidadOfertaDTO>> obtenerHistorialPorOferta(@PathVariable Long idOferta) {
        List<TrazabilidadOfertaDTO> historial = historialOfertaService.getHistorialByOferta(idOferta);
        return ResponseEntity.ok(historial);
    }
}