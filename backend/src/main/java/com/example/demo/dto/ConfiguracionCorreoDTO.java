package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionCorreoDTO {
    private Integer idConfiguracion;
    private String tipo;
    private String valor; // Email de la bolsa
    private String password; // Enmascarado como ***ENCRIPTADA***
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistorialItem {
        private Integer idHistorial;
        private String adminNombre;
        private String adminEmail;
        private String accion;
        private String valorAnterior;
        private String valorNuevo;
        private LocalDateTime fechaCreacion;
        private Boolean exitoso;
        private String detalleError;
        private String ipAddress;
    }
}
