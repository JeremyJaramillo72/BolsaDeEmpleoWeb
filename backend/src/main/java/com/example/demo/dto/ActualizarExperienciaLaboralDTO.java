package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ActualizarExperienciaLaboralDTO {
    private Integer idExpLaboral;
    private List<Integer> cargosIds;
    private Integer idEmpresaCatalogo;
    private String fechaInicio;
    private String fechaFin;
    private String descripcion;
    private Integer idCiudad;
    private MultipartFile archivo;
}
