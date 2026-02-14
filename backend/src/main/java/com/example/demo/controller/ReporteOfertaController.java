package com.example.demo.controller;

import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.service.ReporteOfertaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin
public class ReporteOfertaController {

    private final ReporteOfertaService service;

    public ReporteOfertaController(ReporteOfertaService service) {
        this.service = service;
    }

    @GetMapping("/ofertas")
    public List<ReporteOfertaDTO> reporteOfertas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String ciudad
    ) {
        return service.generarReporte(estado, categoria, ciudad);
    }
}
