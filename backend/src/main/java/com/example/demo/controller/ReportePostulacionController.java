package com.example.demo.controller;

import com.example.demo.dto.FiltroReportePostulacionDTO;
import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.service.ReportePostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReportePostulacionController {

    private final ReportePostulacionService reportePostulacionService;

    @GetMapping("/postulaciones")
    public ResponseEntity<List<ReportePostulacionDTO>> obtenerReporte(
            @RequestParam(required = false) Integer idCiudad,
            @RequestParam(required = false) Integer idCategoria,
            @RequestParam(required = false) Integer idModalidad,
            @RequestParam(required = false) String  estadoValidacion,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        FiltroReportePostulacionDTO filtro = new FiltroReportePostulacionDTO();
        filtro.setIdCiudad(idCiudad);
        filtro.setIdCategoria(idCategoria);
        filtro.setIdModalidad(idModalidad);
        filtro.setEstadoValidacion(estadoValidacion);
        filtro.setFechaInicio(fechaInicio);
        filtro.setFechaFin(fechaFin);

        return ResponseEntity.ok(
                reportePostulacionService.obtenerReporte(filtro)
        );
    }
}