package com.example.demo.dto;

import lombok.Data;
import org.apache.commons.compress.harmony.pack200.NewAttributeBands;

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
    private  Integer idCiudad;
    private Integer idProvincia;
    private String urlFotoPerfil;

    private String formacionAcademica;
    private String experienciaLaboral;
    private String cursosRealizados;
    private String idiomas;
}
