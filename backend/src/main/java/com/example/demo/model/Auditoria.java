package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "auditoria", schema = "seguridad")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seguridad", foreignKey = @ForeignKey(name = "fk_auditoria_seguridad"))
    private Seguridad seguridad;

    @NotBlank(message = "El usuario de base de datos es obligatorio")
    @Size(max = 100)
    @Column(name = "usuario_db", length = 100)
    private String usuarioDb;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @NotBlank(message = "La acción es obligatoria")
    @Size(max = 50)
    @Column(name = "accion", length = 50, nullable = false)
    private String accion;

    @NotBlank(message = "La tabla afectada es obligatoria")
    @Size(max = 50)
    @Column(name = "tabla_afectada", length = 50, nullable = false)
    private String tablaAfectada;

    @NotNull(message = "El ID del registro afectado es obligatorio")
    @Column(name = "id_registro_afectado", nullable = false)
    private Integer idRegistroAfectado;

    @Column(name = "datos_anteriores", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String datosAnteriores;

    @Column(name = "datos_nuevos", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String datosNuevos;

    @Column(name = "campos_modificados", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String camposModificados;

    @PrePersist
    public void prePersist() {
        if (this.fechaHora == null) {
            this.fechaHora = LocalDateTime.now();
        }
    }

    public void setIdSeguridad(Integer idSeguridad) {
    }


}