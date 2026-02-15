package com.example.demo.dto;

import java.math.BigDecimal;

public interface ReporteOfertaDTO {

    Integer getIdOferta();
    String getNombreEmpresa();
    String getNombreCiudad();
    String getNombreModalidad();
    String getNombreJornada();
    String getNombreCategoria();
    BigDecimal getSalarioPromedio();
}

