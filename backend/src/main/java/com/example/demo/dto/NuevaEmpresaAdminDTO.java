package com.example.demo.dto;

import lombok.Data;

@Data
public class NuevaEmpresaAdminDTO {
    private String nombre_empresa;
    private String ruc;
    private String sitio_web;
    private Integer id_provincia; // Angular lo manda, aunque solo usemos la ciudad en el backend
    private Integer id_ciudad;
    private Integer id_categoria; // Angular lo manda, por si lo necesitas a futuro
    private String correo;
    private String contrasenia;
}
