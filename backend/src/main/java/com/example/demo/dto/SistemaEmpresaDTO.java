package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SistemaEmpresaDTO {

    private Integer       idConfig;
    private String        nombreAplicativo;
    private String        descripcion;
    private String        logoUrl;
    private String        correoSoporte;
    private String        telefonoContacto;
    private String        direccionInstitucion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}