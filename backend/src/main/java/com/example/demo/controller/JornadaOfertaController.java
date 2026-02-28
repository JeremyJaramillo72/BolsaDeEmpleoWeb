package com.example.demo.controller;

import com.example.demo.dto.JornadaOfertaDTO;
import com.example.demo.service.JornadaOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jornadas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JornadaOfertaController {

    private final JornadaOfertaService jornadaOfertaService;

    @GetMapping
    public ResponseEntity<List<JornadaOfertaDTO>> obtenerTodas() {
        return ResponseEntity.ok(jornadaOfertaService.obtenerTodas());
    }
}