package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaOfertaDTO {
    private Long idHistorial;
    private Long idOferta;
    private String tituloOferta;
    private String empresa;
    private String usuarioBd;
    private String accion;
    private String estadoActual;
    private LocalDateTime fechaHora;
}