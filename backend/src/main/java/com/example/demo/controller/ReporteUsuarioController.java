package com.example.demo.controller;

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
}
