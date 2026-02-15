package com.example.demo.controller;

import com.example.demo.dto.ReporteUsuarioDTO;
import com.example.demo.service.ReporteUsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin
public class ReporteUsuarioController {

    private final ReporteUsuarioService service;

    public ReporteUsuarioController(ReporteUsuarioService service) {
        this.service = service;
    }

    @GetMapping("/usuarios")
    public List<ReporteUsuarioDTO> reporteUsuarios(
            @RequestParam(required = false) String correo
    ) {
        return service.generarReporte(correo);
    }
}
