package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Postulacion")
@Data
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPostulacion")
    private Integer idPostulacion;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdOferta", nullable = false)
    private OfertaLaboral oferta;

    @Column(name = "EstadoPostulacion", columnDefinition = "VARCHAR(20) DEFAULT 'Enviada'")
    private String estadoPost = "Enviada"; // Ej: "Enviada", "En Revisión", "Aceptada", "Rechazada"

    @Column(name = "FechaPostulacion", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaPostulacion = LocalDateTime.now();
}