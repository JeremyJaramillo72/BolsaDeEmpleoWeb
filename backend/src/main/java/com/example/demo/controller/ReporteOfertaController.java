package com.example.demo.controller;

import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.service.ReporteOfertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes-ofertas")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class ReporteOfertaController {

    @Autowired
    private ReporteOfertaService reporteService;

    @GetMapping("/tabla")
    public ResponseEntity<List<ReporteOfertaDTO>> obtenerOfertas(
            @RequestParam(required = false) Integer idCiudad,
            @RequestParam(required = false) Integer idCategoria,
            @RequestParam(required = false) String busqueda) {

        // Usamos el service que mapea los 9-12 campos del Object[]
        List<ReporteOfertaDTO> lista = reporteService.obtenerReporteDinamico(idCiudad, idCategoria, busqueda, 0, 50);
        return ResponseEntity.ok(lista);
    }
}