package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @Data genera: Getters, Setters, ToString, EqualsAndHashCode.
 * @AllArgsConstructor genera el constructor de 7 parámetros para el Service.
 * @NoArgsConstructor genera el constructor vacío para Jackson/Spring.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportePostulacionDTO {

    private Long idPostulacion;
    private String tituloOferta;
    private String nombreUsuario;
    private String carrera;
    private String estadoValidacion; // CLAVE: Usado en TS para agrupar estadísticas
    private LocalDateTime fechaPostulacion;
    private Long totalRegistros;     // CLAVE: Usado en TS para metadatos de tabla
}