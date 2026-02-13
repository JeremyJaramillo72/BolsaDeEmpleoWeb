package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class EmpresaResumenDTO {
    private Long idUsuario;
    private String nombreEmpresa;
    private String ruc;
    private String correo;
    private String estado;
    private String sitioWeb;
    private String descripcion;
    private LocalDateTime fechaRegistro;


    public EmpresaResumenDTO(Long idUsuario, String nombreEmpresa, String ruc, String correo,
                             String estado, String sitioWeb, String descripcion, LocalDateTime fechaRegistro) {
        this.idUsuario = idUsuario;
        this.nombreEmpresa = nombreEmpresa;
        this.ruc = ruc;
        this.correo = correo;
        this.estado = estado;
        this.sitioWeb = sitioWeb;
        this.descripcion = descripcion;
        this.fechaRegistro = fechaRegistro;
    }
}
