package com.example.demo.repository.Views;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IFavoritaMixtaDTO {
    Integer getIdFavoritas();
    Integer getIdOferta();
    String getOrigenOferta();
    String getEstadoFav();
    String getTitulo();
    String getDescripcion();
    String getNombreEmpresa();
    String getNombreCiudad();
    LocalDate getFechaInicio();
    LocalDate getFechaCierre();
    BigDecimal getSalarioMin();
    BigDecimal getSalarioMax();
    String getUrlAplicar();
    String getIdOrigenExterna();
}

