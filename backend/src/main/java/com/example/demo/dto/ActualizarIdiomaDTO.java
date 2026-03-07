package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ActualizarIdiomaDTO {

    private Integer idUsuarioIdioma;
    private Integer idIdioma;
    private String nivel;
    private MultipartFile archivo;
}
