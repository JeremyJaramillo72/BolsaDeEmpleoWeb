package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IOfertaResumen {
    // Datos de la Oferta
    Long getIdOferta();
    String getTitulo();
    String getDescripcion();
    LocalDate getFechaInicio();
    LocalDate getFechaCierre();
    BigDecimal getSalarioMin();
    BigDecimal getSalarioMax();
    Integer getCantidadVacantes();

    // Datos de la Empresa
    Long getIdEmpresa();
    String getNombreEmpresa();
    String getCorreo();
    String getRucEmpresa();

    // Catalogos
    String getNombreCiudad();
    String getNombreModalidad();
    String getNombreJornada();
    String getNombreCategoria();
}
