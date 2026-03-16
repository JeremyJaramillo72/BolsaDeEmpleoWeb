package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrazabilidadOfertaDTO {
    private Long idHistorial;
    private String accion;
    private LocalDateTime fechaHora;
    private String ejecutor;
    private String campoModificado;
    private String valoresAnteriores; // Llega como String el JSON desde Postgres
    private String valoresNuevos;     // Llega como String el JSON desde Postgres
}