package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantillaNotificacionDTO {
    private Integer idPlantilla;
    private String tipo;
    private String titulo;
    private String contenido;
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
        private String tituloAnterior;
        private String tituloNuevo;
        private String contenidoAnterior;
        private String contenidoNuevo;
        private LocalDateTime fechaCreacion;
        private String ipAddress;
    }
}
