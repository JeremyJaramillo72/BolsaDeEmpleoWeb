package com.example.demo.service;

import com.example.demo.dto.FiltroReporteOfertaDTO;
import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.repository.ReporteOfertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteOfertaService {

    private final ReporteOfertaRepository reporteOfertaRepository;

    public List<ReporteOfertaDTO> obtenerReporte(FiltroReporteOfertaDTO filtro) {

        // Validación 1: rango salarial
        if (filtro.getSalarioMin() != null && filtro.getSalarioMax() != null) {
            if (filtro.getSalarioMax().compareTo(filtro.getSalarioMin()) < 0) {
                throw new IllegalArgumentException(
                        "El salario máximo no puede ser menor al salario mínimo"
                );
            }
        }

        // Validación 2: rango de fechas
        if (filtro.getFechaInicio() != null && filtro.getFechaFin() != null) {
            if (filtro.getFechaFin().isBefore(filtro.getFechaInicio())) {
                throw new IllegalArgumentException(
                        "La fecha fin no puede ser anterior a la fecha inicio"
                );
            }
        }

        // Validación 3: fechas no pueden ser futuras
        if (filtro.getFechaInicio() != null
                && filtro.getFechaInicio().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "La fecha inicio no puede ser una fecha futura"
            );
        }
        if (filtro.getFechaFin() != null
                && filtro.getFechaFin().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "La fecha fin no puede ser una fecha futura"
            );
        }

        return reporteOfertaRepository.ejecutarReporte(filtro);
    }
}