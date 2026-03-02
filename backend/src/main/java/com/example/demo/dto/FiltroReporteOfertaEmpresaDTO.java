package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FiltroReporteOfertaEmpresaDTO {

    // Obligatorio — viene del usuario autenticado, no del request
    private Integer    idEmpresa;

    // Opcionales — mismo conjunto que reporte admin + top exclusivo empresa
    private Integer    top;
    private Integer    idCiudad;
    private Integer    idCategoria;
    private Integer    idModalidad;
    private Integer    idJornada;
    private LocalDate  fechaInicio;
    private LocalDate  fechaFin;
    private BigDecimal salarioMin;
    private BigDecimal salarioMax;
    private String     estadoOferta;
}