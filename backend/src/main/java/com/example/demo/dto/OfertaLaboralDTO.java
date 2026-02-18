package com.example.demo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class OfertaLaboralDTO {
    private Long idOferta;

    private Long idEmpresa;
    private Integer idModalidad;
    private Integer idCategoria;
    private Integer idJornada;
    private Integer idCiudad;
    private Integer idProvincia;


    private String titulo;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaCierre;
    private String estadoOferta;
    private List<OfertaHabilidadDTO> habilidades;
    private Integer cantidadVacantes;
    private Integer experienciaMinima;
    private BigDecimal salarioMin;
    private BigDecimal salarioMax;
    private List <RequisitoManualDTO> requisitos_manuales;

}
