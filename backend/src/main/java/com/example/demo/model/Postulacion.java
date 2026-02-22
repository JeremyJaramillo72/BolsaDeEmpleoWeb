package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion", schema = "postulaciones")
@Data
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_postulacion")
    private Integer idPostulacion;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_oferta", nullable = false)
    private OfertaLaboral ofertaLaboral;

    @Column(name = "archivo_cv", length = 500)
    private String archivoCv;

    @Column(name = "fecha_postulacion")
    private LocalDateTime fechaPostulacion;

    @Column(name = "estado_validacion", length = 20)
    private String estadoValidacion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @PrePersist
    public void prePersist() {
        if (this.fechaPostulacion == null) {
            this.fechaPostulacion = LocalDateTime.now();
        }
        if (this.estadoValidacion == null) {
            this.estadoValidacion = "Pendiente";
        }
    }
}

