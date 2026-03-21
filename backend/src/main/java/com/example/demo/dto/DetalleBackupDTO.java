package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.sql.Timestamp;

@Data
public class DetalleBackupDTO {
    @JsonProperty("id_auditoria")
    private Long idAuditoria;

    @JsonProperty("fecha_ejecucion")
    private Timestamp fechaEjecucion;

    @JsonProperty("tipo_accion")
    private String tipoAccion;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("mensaje_error")
    private String mensajeError;

    @JsonProperty("tamano_bytes")
    private Long tamanoBytes;

    @JsonProperty("url_azure")
    private String urlAzure;

    public DetalleBackupDTO(Long idAuditoria, Timestamp fechaEjecucion, String tipoAccion, String estado, String mensajeError, Long tamanoBytes, String urlAzure) {
        this.idAuditoria = idAuditoria;
        this.fechaEjecucion = fechaEjecucion;
        this.tipoAccion = tipoAccion;
        this.estado = estado;
        this.mensajeError = mensajeError;
        this.tamanoBytes = tamanoBytes;
        this.urlAzure = urlAzure;
    }
}