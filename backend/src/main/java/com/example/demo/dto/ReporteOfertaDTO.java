package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteOfertaDTO {

    private Long        idOferta;
    private String      titulo;
    private String      nombreEmpresa;
    private String      nombreProvincia;
    private String      nombreCiudad;
    private String      nombreModalidad;
    private String      nombreJornada;
    private String      nombreCategoria;
    private BigDecimal  salarioMin;
    private BigDecimal  salarioMax;
    private Integer     cantidadVacantes;
    private Integer     experienciaMinima;
    private LocalDate   fechaInicio;
    private LocalDate   fechaCierre;
    private String      estadoOferta;
    private LocalDateTime fechaCreacion;
}