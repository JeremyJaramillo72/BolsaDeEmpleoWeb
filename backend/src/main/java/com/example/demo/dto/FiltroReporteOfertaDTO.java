package com.example.demo.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FiltroReporteOfertaDTO {

    private Integer idCiudad;
    private Integer idCategoria;
    private Integer idModalidad;
    private Integer idJornada;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;

    private BigDecimal salarioMin;
    private BigDecimal salarioMax;

    // Default: 'Activa' — si llega null desde frontend se asume Activa
    private String estadoOferta = "Activa";
}