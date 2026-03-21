package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.sql.Timestamp;

@Data
public class ResumenBackupDTO {
    @JsonProperty("id_usuario") // ✅ Esto asegura que Angular lo vea como id_usuario
    private Long idUsuario;

    @JsonProperty("correo_ejecutor")
    private String correoEjecutor;

    @JsonProperty("total_acciones_realizadas")
    private Long totalAccionesRealizadas;

    @JsonProperty("fecha_ultimo_backup")
    private Timestamp fechaUltimoBackup;

    public ResumenBackupDTO(Long idUsuario, String correoEjecutor, Long totalAccionesRealizadas, Timestamp fechaUltimoBackup) {
        this.idUsuario = idUsuario;
        this.correoEjecutor = correoEjecutor;
        this.totalAccionesRealizadas = totalAccionesRealizadas;
        this.fechaUltimoBackup = fechaUltimoBackup;
    }
}