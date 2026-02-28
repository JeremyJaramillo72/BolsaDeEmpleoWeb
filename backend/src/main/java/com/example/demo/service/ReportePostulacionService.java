package com.example.demo.service;

import com.example.demo.dto.FiltroReportePostulacionDTO;
import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.repository.ReportePostulacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportePostulacionService {

    private final ReportePostulacionRepository reportePostulacionRepository;

    public List<ReportePostulacionDTO> obtenerReporte(
            FiltroReportePostulacionDTO filtro) {

        // Validación 1: rango de fechas
        if (filtro.getFechaInicio() != null && filtro.getFechaFin() != null) {
            if (filtro.getFechaFin().isBefore(filtro.getFechaInicio())) {
                throw new IllegalArgumentException(
                        "La fecha fin no puede ser anterior a la fecha inicio"
                );
            }
        }

        // Validación 2: fechas no futuras
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

        // Validación 3: estado de validación solo acepta valores conocidos
        if (filtro.getEstadoValidacion() != null
                && !filtro.getEstadoValidacion().isBlank()) {
            List<String> estadosValidos =
                    List.of("Pendiente", "Revisado", "Aceptado", "Rechazado");
            if (!estadosValidos.contains(filtro.getEstadoValidacion())) {
                throw new IllegalArgumentException(
                        "Estado de validación no válido: "
                                + filtro.getEstadoValidacion()
                );
            }
        }

        return reportePostulacionRepository.ejecutarReporte(filtro);
    }
}