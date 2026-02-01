package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class OfertaDetalleDTO {
    private String tituloOferta;
    private Long idEmpresa;
    private String ciudadNombre;
    private String provinciaNombre;
    private BigDecimal salario;
    private LocalDate fechaCierre;
}