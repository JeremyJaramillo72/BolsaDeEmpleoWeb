package com.example.demo.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ResumenPerfilBaseDTO {
    private String nombre;
    private String apellido;
    private String correo;
    private String urlFotoPerfil;
    private String archivoCv;
    private Date   fechaPostulacion;
    private String estadoPostulacion;
    private String mensajeEvaluacion;
    private String nombreEmpresa;
}

