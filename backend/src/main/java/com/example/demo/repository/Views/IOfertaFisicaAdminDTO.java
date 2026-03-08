package com.example.demo.repository.Views;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface IOfertaFisicaAdminDTO {
    Long getIdOferta();
    Long getIdEmpresa();
    String getNombreEmpresa();
    Integer getIdModalidad();
    String getModalidad();
    Integer getIdCategoria();
    Integer getIdJornada();
    String getJornada();
    Integer getIdProvincia();
    Integer getIdCiudad();
    String getCiudad();
    String getTitulo();
    String getDescripcion();
    BigDecimal getSalarioMin();
    BigDecimal getSalarioMax();
    Integer getCantidadVacantes();
    Integer getExperienciaMinima();
    LocalDate getFechaInicio();
    LocalDate getFechaCierre();
    String getEstadoOferta();
    LocalDateTime getFechaCreacion();
    Long getPostulantes();

    // Las listas en formato JSON Text
    String getHabilidades();
    String getRequisitosManuales();
}
