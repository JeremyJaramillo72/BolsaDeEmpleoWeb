package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrazabilidadPostulanteDTO {
    private Long idHistorial;
    private String seccion;
    private String accion;
    private LocalDateTime fechaHora;
    private String ejecutor;
    private String camposModificados;
    private String valoresAnteriores;
    private String valoresNuevos;
}