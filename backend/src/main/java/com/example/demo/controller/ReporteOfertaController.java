package com.example.demo.controller;

import com.example.demo.dto.FiltroReporteOfertaDTO;
import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.service.ReporteOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReporteOfertaController {

    private final ReporteOfertaService reporteOfertaService;

    @GetMapping("/ofertas")
    public ResponseEntity<List<ReporteOfertaDTO>> obtenerReporte(
            @RequestParam(required = false) Integer    idCiudad,
            @RequestParam(required = false) Integer    idCategoria,
            @RequestParam(required = false) Integer    idModalidad,
            @RequestParam(required = false) Integer    idJornada,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) BigDecimal salarioMin,
            @RequestParam(required = false) BigDecimal salarioMax,
            // ✅ CORREGIDO: sin defaultValue — llega null cuando no se filtra
            @RequestParam(required = false) String     estadoOferta
    ) {
        FiltroReporteOfertaDTO filtro = new FiltroReporteOfertaDTO();
        filtro.setIdCiudad(idCiudad);
        filtro.setIdCategoria(idCategoria);
        filtro.setIdModalidad(idModalidad);
        filtro.setIdJornada(idJornada);
        filtro.setFechaInicio(fechaInicio);
        filtro.setFechaFin(fechaFin);
        filtro.setSalarioMin(salarioMin);
        filtro.setSalarioMax(salarioMax);
        // ✅ Convierte cadena vacía a null por si el frontend envía ""
        filtro.setEstadoOferta(
                (estadoOferta != null && !estadoOferta.trim().isEmpty()) ? estadoOferta : null
        );

        List<ReporteOfertaDTO> resultado = reporteOfertaService.obtenerReporte(filtro);
        return ResponseEntity.ok(resultado);
    }
}