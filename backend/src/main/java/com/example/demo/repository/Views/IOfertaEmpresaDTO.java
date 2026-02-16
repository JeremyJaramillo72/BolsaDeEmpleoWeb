package com.example.demo.repository.Views;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface IOfertaEmpresaDTO {
    Long getId_oferta();
    Long getId_empresa();
    Integer getId_modalidad();
    String getModalidad();
    Integer getId_categoria();
    Integer getId_jornada();
    String getJornada();
    Integer getId_ciudad();
    String getCiudad();
    String getTitulo();
    String getDescripcion();
    BigDecimal getSalario_min();
    BigDecimal getSalario_max();
    Integer getCantidad_vacantes();
    Integer getExperiencia_minima();
    LocalDate getFecha_inicio();
    LocalDate getFecha_cierre();
    String getEstado_oferta();
    LocalDateTime getFecha_creacion();
    Long getPostulantes();

    String getHabilidades();
    String getRequisitos_manuales();
}
