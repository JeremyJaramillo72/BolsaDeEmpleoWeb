package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportePostulacionDTO {

    private Long          idPostulacion;
    private String        tituloOferta;
    private String        nombreEmpresa;
    private String        nombreModalidad;
    private String        nombreCategoria;
    private String        nombreCiudad;
    private String        nombrePostulante;
    private String        correoPostulante;
    private LocalDateTime fechaPostulacion;
    private String        estadoValidacion;
    private String        observaciones;
}