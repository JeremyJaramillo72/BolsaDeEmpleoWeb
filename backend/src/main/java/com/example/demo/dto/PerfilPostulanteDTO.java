package com.example.demo.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PerfilPostulanteDTO {
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String genero;
    private String archivoCv;
    private Date fechaPostulacion;
    private String urlFotoPerfil;
/* hola*/
    private String formacionAcademica;
    private String experienciaLaboral;
    private String cursosRealizados;
    private String idiomas;
}
