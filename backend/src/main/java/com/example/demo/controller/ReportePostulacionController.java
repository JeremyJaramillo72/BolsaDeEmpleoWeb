package com.example.demo.controller;

import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.service.ReportePostulacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reporte-postulaciones")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class ReportePostulacionController {

    @Autowired
    private ReportePostulacionService service;

    @GetMapping("/tabla")
    public ResponseEntity<?> verTabla(
            @RequestParam(required = false) Long idOferta,
            @RequestParam(required = false) Integer idCarrera,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            List<ReportePostulacionDTO> lista = service.obtenerReporte(idOferta, idCarrera, estado, null, null, page, size);

            Map<String, Object> response = new HashMap<>();
            response.put("datos", lista);
            // El total de registros viene dentro de cualquier objeto de la lista (gracias al COUNT OVER)
            response.put("total", lista.isEmpty() ? 0 : lista.get(0).getTotalRegistros());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en base de datos: " + e.getMessage());
        }
    }
}