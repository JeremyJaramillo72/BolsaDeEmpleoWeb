package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class OfertaExtraInfoDTO {
    @JsonProperty("idOferta")
    private Integer idOferta;

    @JsonProperty("nombreCiudad")
    private String  nombreCiudad;

    @JsonProperty("nombreEmpresa")
    private String  nombreEmpresa;

    @JsonProperty("habilidades")
    private List<HabilidadInfoDTO> habilidades;

    @JsonProperty("requisitos")
    private List<RequisitoInfoDTO> requisitos;

    @Data
    public static class HabilidadInfoDTO {
        @JsonProperty("idHabilidad")
        private Integer idHabilidad;

        @JsonProperty("nombreHabilidad")
        private String  nombreHabilidad;

        @JsonProperty("nivelRequerido")
        private String  nivelRequerido;

        @JsonProperty("esObligatorio")
        private Boolean esObligatorio;
    }

    @Data
    public static class RequisitoInfoDTO {
        @JsonProperty("idRequisitoManual")
        private Integer idRequisitoManual;

        @JsonProperty("descripcion")
        private String  descripcion;

        @JsonProperty("esObligatorio")
        private Boolean esObligatorio;
    }
}

