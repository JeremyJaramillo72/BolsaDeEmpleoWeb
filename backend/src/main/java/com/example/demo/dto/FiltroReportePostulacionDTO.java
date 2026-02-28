package com.example.demo.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class FiltroReportePostulacionDTO {

    // Combobox buscable — opcional
    private Integer idCiudad;
    private Integer idCategoria;
    private Integer idModalidad;

    // Combobox simple — opcional
    // Valores válidos: Pendiente, Revisado, Aceptado, Rechazado
    private String estadoValidacion;

    // Date pickers — opcionales
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;
}
