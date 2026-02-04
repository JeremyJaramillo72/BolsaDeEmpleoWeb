package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioEmpresaDTO {
    private long IdUsuario;
    private long idEmpresa;
    private String nombre;
    private String ruc;
    private String sitioWeb;
    private String descripcion;
    private LocalDateTime fechaRegistro;

}
