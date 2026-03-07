package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ActualizarAcademicoDTO {
    private Integer idAcademico;
    private Integer idCarrera;
    private String fechaGraduacion;
    private String numeroSenescyt;
    private MultipartFile archivo;
}
