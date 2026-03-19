package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones", schema = "seguridad")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long idSesion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_seguridad",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_sesion_seguridad")
    )
    private Seguridad seguridad;

    @Column(name = "fecha_inicio", insertable = false, updatable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "navegador", length = 255)
    private String navegador;

    @Column(name = "dispositivo", length = 100)
    private String dispositivo;

    @Column(name = "accion", length = 20)
    private String accion;

    @PrePersist
    public void prePersist() {
        if (this.accion == null) {
            this.accion = "INACTIVA";
        }
    }
}