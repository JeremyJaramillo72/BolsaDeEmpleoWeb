package com.example.demo.controller;

import com.example.demo.dto.CategoriaOfertaDTO;
import com.example.demo.service.CategoriaOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategoriaOfertaController {

    private final CategoriaOfertaService categoriaOfertaService;

    @GetMapping
    public ResponseEntity<List<CategoriaOfertaDTO>> obtenerTodas() {
        return ResponseEntity.ok(categoriaOfertaService.obtenerTodas());
    }
}