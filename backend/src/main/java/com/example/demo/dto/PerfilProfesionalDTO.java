package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PerfilProfesionalDTO
{
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String genero;
    private LocalDate fechaNacimiento;
    private String ubicacion;
    private String urlFotoPerfil;

    private String formacionAcademica;
    private String experienciaLaboral;
    private String cursosRealizados;
    private String idiomas;
}
