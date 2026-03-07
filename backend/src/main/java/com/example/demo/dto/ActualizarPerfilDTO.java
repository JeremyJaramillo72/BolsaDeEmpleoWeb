package com.example.demo.dto;

import lombok.Data;

@Data
public class ActualizarPerfilDTO {
    private String nombreCompleto;
    private String fechaNacimiento;
    private String genero;
    private String telefono;
    private Integer idCiudad;
}
