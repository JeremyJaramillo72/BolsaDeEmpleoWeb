package com.example.demo.service;

import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.repository.ReportePostulacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportePostulacionService {

    private final ReportePostulacionRepository repository;

    public ReportePostulacionService(ReportePostulacionRepository repository) {
        this.repository = repository;
    }

    public List<ReportePostulacionDTO> generarReporte(String estadoValidacion) {

        if (estadoValidacion != null && estadoValidacion.isBlank()) {
            estadoValidacion = null;
        }

        return repository.obtenerReportePostulaciones(estadoValidacion);
    }
}
