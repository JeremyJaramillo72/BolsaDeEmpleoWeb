package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class NotificacionDTO {
    private Integer idNotificacion;
    private String titulo;
    private String mensaje;
    private String tipo;
    private String icono;
    private String enlace;
    private Map<String, Object> datos;
    private Boolean leida;
    private LocalDateTime fechaCreacion;
}