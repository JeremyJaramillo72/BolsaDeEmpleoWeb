package com.example.demo.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PostulanteResumenDTO {
    private Long idPostulacion;
    private String nombreCompleto;
    private String profesion;
    private Date fechaPostulacion;
    private String estado;

}
