package com.example.demo.controller;

import com.example.demo.dto.FiltroReporteOfertaEmpresaDTO;
import com.example.demo.dto.ReporteOfertaEmpresaDTO;
import com.example.demo.service.ReporteOfertaEmpresaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes-empresa")
@CrossOrigin(origins = "*")
public class ReporteOfertaEmpresaController {

    private final ReporteOfertaEmpresaService service;

    public ReporteOfertaEmpresaController(ReporteOfertaEmpresaService service) {
        this.service = service;
    }

    /**
     * GET /api/reportes-empresa/ofertas
     *
     * Parámetros:
     *   idEmpresa    — OBLIGATORIO
     *   top          — Opcional: 5 | 10 | 15 | 20
     *   idCiudad     — Opcional
     *   idCategoria  — Opcional
     *   idModalidad  — Opcional
     *   idJornada    — Opcional
     *   fechaInicio  — Opcional: yyyy-MM-dd
     *   fechaFin     — Opcional: yyyy-MM-dd
     *   salarioMin   — Opcional
     *   salarioMax   — Opcional
     *   estadoOferta — Opcional: aprobado | pendiente | rechazada | cancelada
     */
    @GetMapping("/ofertas")
    public ResponseEntity<?> obtenerReporteOfertas(
            // ✅ Fix: era Integer — debe ser Long (BIGINT en BD)
            @RequestParam                                              Long       idEmpresa,
            @RequestParam(required = false)                            Integer    top,
            @RequestParam(required = false)                            Integer    idCiudad,
            @RequestParam(required = false)                            Integer    idCategoria,
            @RequestParam(required = false)                            Integer    idModalidad,
            @RequestParam(required = false)                            Integer    idJornada,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)             LocalDate  fechaInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)             LocalDate  fechaFin,
            @RequestParam(required = false)                            BigDecimal salarioMin,
            @RequestParam(required = false)                            BigDecimal salarioMax,
            @RequestParam(required = false)                            String     estadoOferta
    ) {
        try {
            // ✅ Fix: normalizar estadoOferta vacío a null ANTES del builder
            // Si el frontend envía "" el Service lo rechazaría contra ESTADOS_VALIDOS
            final String estadoNormalizado =
                    (estadoOferta != null && !estadoOferta.trim().isEmpty())
                            ? estadoOferta.trim()
                            : null;

            FiltroReporteOfertaEmpresaDTO filtro =
                    FiltroReporteOfertaEmpresaDTO.builder()
                            .idEmpresa(idEmpresa)
                            .top(top)
                            .idCiudad(idCiudad)
                            .idCategoria(idCategoria)
                            .idModalidad(idModalidad)
                            .idJornada(idJornada)
                            .fechaInicio(fechaInicio)
                            .fechaFin(fechaFin)
                            .salarioMin(salarioMin)
                            .salarioMax(salarioMax)
                            .estadoOferta(estadoNormalizado)  // ✅ null si vacío
                            .build();

            List<ReporteOfertaEmpresaDTO> resultado =
                    service.obtenerReporte(filtro);

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "error",   "Error interno al generar el reporte",
                            "detalle", e.getMessage()
                    ));
        }
    }
}