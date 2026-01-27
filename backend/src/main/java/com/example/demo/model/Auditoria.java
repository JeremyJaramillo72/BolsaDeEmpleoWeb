package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "auditoria")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    // En la imagen es 'id_seguridad', no 'id_usuario'.
    // Lo dejo como Integer. Si tienes una entidad 'Seguridad', cámbialo a @ManyToOne.
    @Column(name = "id_seguridad")
    private Integer idSeguridad;

    // Campo nuevo según la imagen: varchar(100)
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
    private String datosAnteriores;

    @Column(name = "datos_nuevos", columnDefinition = "jsonb")
    private String datosNuevos;

    @PrePersist
    public void prePersist() {
        if (this.fechaHora == null) {
            this.fechaHora = LocalDateTime.now();
        }
    }
}