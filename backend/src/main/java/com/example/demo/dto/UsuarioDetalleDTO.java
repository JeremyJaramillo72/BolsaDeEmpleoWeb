package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioDetalleDTO {
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private Integer idRol;
    private String nombreRol;
    private Integer idCiudad;
    private String nombreCiudad;
    private String estadoValidacion;
}
