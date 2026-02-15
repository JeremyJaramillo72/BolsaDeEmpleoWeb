package com.example.demo.controller;

import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.service.ReportePostulacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin
public class ReportePostulacionController {

    private final ReportePostulacionService service;

    public ReportePostulacionController(ReportePostulacionService service) {
        this.service = service;
    }

    @GetMapping("/postulaciones")
    public List<ReportePostulacionDTO> reportePostulaciones(
            @RequestParam(required = false) String estadoValidacion
    ) {
        return service.generarReporte(estadoValidacion);
    }
}
