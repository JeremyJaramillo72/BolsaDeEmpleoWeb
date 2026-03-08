package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones", schema = "seguridad")
@Data // Usamos Lombok para que te genere los getters y setters automáticamente
@NoArgsConstructor
@AllArgsConstructor
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long idSesion;

    /* * OPCIÓN 1: Mapeo simple (Si solo necesitas el número del ID)
     */
    @Column(name = "id_seguridad", nullable = false)
    private Integer idSeguridad;

    /*
     * OPCIÓN 2: Mapeo relacional (Descomenta esto y borra la Opción 1
     * si ya tienes creada la entidad Seguridad.java)
     * * @ManyToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "id_seguridad", nullable = false)
     * private Seguridad seguridad;
     */

    @Column(name = "fecha_inicio", insertable = false, updatable = false)
    // insertable = false deja que la BD ponga el DEFAULT now() como lo tienes en tu SQL
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

    // Si la acción por defecto es INACTIVA en BD, puedes asegurarlo también desde Java:
    @PrePersist
    public void prePersist() {
        if (this.accion == null) {
            this.accion = "INACTIVA";
        }
    }
}