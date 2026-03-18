package com.example.demo.service;

import com.example.demo.repository.ReporteUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteUsuarioService {

    private final ReporteUsuarioRepository repository;

    public ReporteUsuarioService(ReporteUsuarioRepository repository) {
        this.repository = repository;
    }

    }

