package com.example.demo.controller;

import com.example.demo.dto.ModalidadOfertaDTO;
import com.example.demo.service.ModalidadOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modalidades")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ModalidadOfertaController {

    private final ModalidadOfertaService modalidadOfertaService;

    @GetMapping
    public ResponseEntity<List<ModalidadOfertaDTO>> obtenerTodas() {
        return ResponseEntity.ok(modalidadOfertaService.obtenerTodas());
    }
}
