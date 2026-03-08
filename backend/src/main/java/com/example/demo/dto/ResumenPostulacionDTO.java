package com.example.demo.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ResumenPostulacionDTO {
    private String nombre;
    private String apellido;
    private String correo;
    private String urlFotoPerfil;
    private String archivoCv;
    private Date fechaPostulacion;
    private String estadoPostulacion;
    private String mensajeEvaluacion;
    private String formacionAcademica;
    private String experienciaLaboral;
    private String cursosRealizados;
    private String idiomas;
    private String nombreEmpresa;
}
