package com.example.demo.service;

import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.repository.ReporteOfertaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteOfertaService {

    private final ReporteOfertaRepository repository;

    public ReporteOfertaService(ReporteOfertaRepository repository) {
        this.repository = repository;
    }

    public List<ReporteOfertaDTO> generarReporte(
            String estado,
            String categoria,
            String ciudad
    ) {
        return repository.obtenerReporteOfertas(estado, categoria, ciudad);
    }
}

