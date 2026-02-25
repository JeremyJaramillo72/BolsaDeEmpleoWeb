package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @Data genera automáticamente: Getters, Setters, RequiredArgsConstructor,
 * ToString, EqualsAndHashCode.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteOfertaDTO {

    private Long idOferta;
    private String titulo;
    private String empresaNombre;
    private String ciudad;
    private String categoria;        // Usado en TS para el gráfico
    private String modalidad;
    private String estado;
    private BigDecimal salarioMinimo;
    private BigDecimal salarioMaximo;
    private BigDecimal salarioPromedio; // Requerido por el Exportador
    private LocalDate fechaPublicacion;
    private LocalDate fechaExpiracion;
    private Long totalRegistros;     // Usado para paginación
}