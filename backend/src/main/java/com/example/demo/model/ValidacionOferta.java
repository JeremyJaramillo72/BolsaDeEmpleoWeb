package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "validacion_oferta", schema = "postulaciones")
@Data
public class ValidacionOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion_oferta")
    private Integer idValidacionOferta;

    // Relación con la Oferta que se está validando
    @ManyToOne
    @JoinColumn(name = "id_oferta")
    private OfertaLaboral ofertaLaboral;

    // Relación con el Usuario (revisor/administrador)
    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "estado_validacion", length = 20)
    private String estadoValidacion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_revision", insertable = false, updatable = false)
    private LocalDateTime fechaRevision;
}