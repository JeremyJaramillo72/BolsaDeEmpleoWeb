package com.example.demo.repository.Views;

import java.time.LocalDateTime;

public interface IEmpresaResumenProjection {
    Long getIdUsuario();
    String getNombreEmpresa();
    String getRuc();
    String getCorreo();
    String getEstado();
    String getSitioWeb();
    String getDescripcion();
    LocalDateTime getFechaRegistro();
    String getNombreCiudad();
}
