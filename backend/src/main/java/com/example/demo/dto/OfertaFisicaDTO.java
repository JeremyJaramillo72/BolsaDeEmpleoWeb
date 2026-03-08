package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class OfertaFisicaDTO {
    private Integer idUsuarioAdmin;
    private Integer idEmpresa;
    private String titulo;
    private String descripcion;
    private Integer idModalidad;
    private Integer idCategoria;
    private Integer idJornada;
    private Integer idProvincia;
    private Integer idCiudad;
    private Double salarioMin;
    private Double salarioMax;
    private Integer cantidadVacantes;
    private Integer experienciaMinima;
    private String fechaCierre;

    private String habilidades;
    private List<RequisitoManualDTO> requisitos_manuales;
    private MultipartFile archivoOficio;
}
