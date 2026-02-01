package com.example.demo.controller;

import com.example.demo.service.Impl.OfertaLaboralServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "*")
public class OfertaLaboralController {

    @Autowired
    private OfertaLaboralServiceImpl service;

    @GetMapping("/mayor-salario/{idEmpresa}")
    public ResponseEntity<?> obtenerMayorSalario(@PathVariable Integer idEmpresa) {
        return ResponseEntity.ok(service.verMejorOferta(idEmpresa));
    }
}