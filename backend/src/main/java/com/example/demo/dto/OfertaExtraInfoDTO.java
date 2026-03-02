package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class OfertaExtraInfoDTO {
    private Integer idOferta;
    private String  nombreCiudad;
    private List<HabilidadInfoDTO> habilidades;
    private List<RequisitoInfoDTO> requisitos;

    @Data
    public static class HabilidadInfoDTO {
        private Integer idHabilidad;
        private String  nombreHabilidad;
        private String  nivelRequerido;
        private Boolean esObligatorio;
    }

    @Data
    public static class RequisitoInfoDTO {
        private Integer idRequisitoManual;
        private String  descripcion;
        private Boolean esObligatorio;
    }
}

