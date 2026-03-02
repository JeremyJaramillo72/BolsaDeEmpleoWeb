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
public class ReporteOfertaEmpresaDTO {

    private Long       idOferta;
    private String     titulo;
    private String     nombreCategoria;
    private String     nombreModalidad;
    private String     nombreJornada;
    private String     nombreCiudad;
    private BigDecimal salarioMin;
    private BigDecimal salarioMax;
    private LocalDate  fechaInicio;
    private LocalDate  fechaCierre;
    private String     estadoOferta;
    private Integer    cantidadVacantes;
    private Integer    experienciaMinima;
    private Long       totalPostulaciones;
    private Long       postulacionesPendientes;
    private Long       postulacionesAceptadas;
    private Long       postulacionesRechazadas;
}