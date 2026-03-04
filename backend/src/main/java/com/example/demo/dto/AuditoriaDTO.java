package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaDTO {
    private Integer idAuditoria;
    private String usuarioDb;
    private String loginName;
    private LocalDateTime fechaHora;
    private String accion;
    private String tablaAfectada;
    private Integer idRegistroAfectado;
    private Object datosAnteriores;
    private Object datosNuevos;
}