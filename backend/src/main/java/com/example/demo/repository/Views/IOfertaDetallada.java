package com.example.demo.repository.Views;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IOfertaDetallada {
    Integer getIdOferta();
    String getTitulo();
    String getDescripcion();
    Integer getCantidadVacantes();
    Integer getExperienciaMinima();
    LocalDate getFechaInicio();
    LocalDate getFechaCierre();
    String getNombreModalidad();
    String getNombreJornada();
    String getNombreCategoria();
    BigDecimal getSalarioMin();
    BigDecimal getSalarioMax();
    String getEstadoOferta();
    Integer getIdFavoritas();
    String getEstadoFav();
    Long getIdPostulacion();
    String getEstadoValidacion();
}
