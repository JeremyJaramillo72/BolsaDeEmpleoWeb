package com.example.demo.controller;

import com.example.demo.dto.CiudadDTO;
import com.example.demo.service.CiudadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CiudadController {

    private final CiudadService ciudadService;

    @GetMapping
    public ResponseEntity<List<CiudadDTO>> obtenerTodas() {
        return ResponseEntity.ok(ciudadService.obtenerTodas());
    }
}
