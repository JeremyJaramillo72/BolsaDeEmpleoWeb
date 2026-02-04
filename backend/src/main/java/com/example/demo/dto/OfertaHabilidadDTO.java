package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfertaHabilidadDTO
{
    private Integer idHabilidad;
    private String nivelRequerido;
    private Boolean esObligatorio;
}
