package com.example.demo.dto;

import java.util.Date;

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

    public String getNombre() { return nombre; }
    public void setNombre(String v) { this.nombre = v; }

    public String getApellido() { return apellido; }
    public void setApellido(String v) { this.apellido = v; }

    public String getCorreo() { return correo; }
    public void setCorreo(String v) { this.correo = v; }

    public String getUrlFotoPerfil() { return urlFotoPerfil; }
    public void setUrlFotoPerfil(String v) { this.urlFotoPerfil = v; }

    public String getArchivoCv() { return archivoCv; }
    public void setArchivoCv(String v) { this.archivoCv = v; }

    public Date getFechaPostulacion() { return fechaPostulacion; }
    public void setFechaPostulacion(Date v) { this.fechaPostulacion = v; }

    public String getEstadoPostulacion() { return estadoPostulacion; }
    public void setEstadoPostulacion(String v) { this.estadoPostulacion = v; }

    public String getMensajeEvaluacion() { return mensajeEvaluacion; }
    public void setMensajeEvaluacion(String v) { this.mensajeEvaluacion = v; }

    public String getFormacionAcademica() { return formacionAcademica; }
    public void setFormacionAcademica(String v) { this.formacionAcademica = v; }

    public String getExperienciaLaboral() { return experienciaLaboral; }
    public void setExperienciaLaboral(String v) { this.experienciaLaboral = v; }

    public String getCursosRealizados() { return cursosRealizados; }
    public void setCursosRealizados(String v) { this.cursosRealizados = v; }

    public String getIdiomas() { return idiomas; }
    public void setIdiomas(String v) { this.idiomas = v; }
}

