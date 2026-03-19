package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_backups", schema = "seguridad")
@Data
public class HistorialBackup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_backup")
    private Long idBackup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_config",
            foreignKey = @ForeignKey(name = "fk_historial_config")
    )
    private ConfiguracionBackup configuracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_usuario_ejecutor",
            foreignKey = @ForeignKey(name = "fk_historial_usuario")
    )
    private Usuario usuarioEjecutor;

    @Column(name = "fecha_ejecucion", insertable = false, updatable = false)
    private LocalDateTime fechaEjecucion;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "estado")
    private String estado;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "url_azure")
    private String urlAzure;

    @Column(name = "mensaje_error")
    private String mensajeError;
}