package com.example.demo.dto;

import lombok.Data;

@Data
public class EnlazarRolDTO {
    private String idRolBd; // El frontend lo manda como String según tu TS
    private Integer idRolAplicativo;
    private String permisosUi;
}