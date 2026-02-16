package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion", schema = "postulaciones")
@Data
public class Postulacion {@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_validacion_doc") //
private Integer idValidacionDoc;

    @ManyToOne
    @JoinColumn(name = "id_documentacion", nullable = false)
    private documentacion_academica documentacion;

    @ManyToOne
    @JoinColumn(name = "id_postulacion", nullable = false)
    private Postulacion postulacion;


    @Column(name = "estado_validacion", length = 20) //
    private String estadoValidacion;

    @Column(name = "observaciones", columnDefinition = "TEXT") //
    private String observaciones;

    @Column(name = "fecha_revision") //
    private LocalDateTime fechaRevision;

    @PrePersist
    public void prePersist() {
        if (this.fechaRevision == null) {
            this.fechaRevision = LocalDateTime.now();
        }
    }
}