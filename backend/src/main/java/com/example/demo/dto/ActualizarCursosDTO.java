package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ActualizarCursosDTO {
    Integer idCurso;
    String nombreCurso;
    String institucion;
    Integer horasDuracion;
    MultipartFile archivo;
}
