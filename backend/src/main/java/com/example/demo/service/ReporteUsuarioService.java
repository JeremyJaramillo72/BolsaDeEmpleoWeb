package com.example.demo.service;

import com.example.demo.dto.ReporteUsuarioDTO;
import com.example.demo.repository.ReporteUsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteUsuarioService {

    private final ReporteUsuarioRepository repository;

    public ReporteUsuarioService(ReporteUsuarioRepository repository) {
        this.repository = repository;
    }

    public List<ReporteUsuarioDTO> generarReporte(String correo) {
        return repository.obtenerReporteUsuarios(correo);
    }
}

