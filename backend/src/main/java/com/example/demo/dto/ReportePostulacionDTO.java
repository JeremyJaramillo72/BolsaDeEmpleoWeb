package com.example.demo.dto;

import java.time.LocalDateTime;

public interface ReportePostulacionDTO {

    String getTitulo();
    String getNombre();
    String getApellido();
    LocalDateTime getFechaPostulacion();
    String getEstadoValidacion();
}

