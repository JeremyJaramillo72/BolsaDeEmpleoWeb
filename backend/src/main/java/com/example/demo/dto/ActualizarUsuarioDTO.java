package com.example.demo.dto;

import lombok.Data;

@Data
public class ActualizarUsuarioDTO {
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private Integer rolId;
    private Integer idCiudad;
    private String contrasena;
}
