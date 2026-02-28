package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CiudadDTO {
    private Integer idCiudad;
    private String  nombreCiudad;
    private String  nombreProvincia;
}