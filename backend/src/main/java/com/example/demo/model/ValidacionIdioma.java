package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "ValidacionIdioma", schema = "postulaciones")
@Data
public class ValidacionIdioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdValidacionIdioma")
    private Integer idValidacionIdioma;

    @ManyToOne
    @JoinColumn(name = "IdPostulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "IdUsuarioIdioma", nullable = false)
    private UsuarioIdioma usuarioIdioma;

    @Column(
            name = "EstadoValidacion",
            nullable = false,
            columnDefinition = "VARCHAR(20) DEFAULT 'Pendiente'"
    )
    private String estadoValidacion = "Pendiente"; // Ej: "Certificado Válido", "Nivel Insuficiente", "Pendiente"

    @Column(name = "Observaciones", columnDefinition = "TEXT")
    private String observaciones; // Notas sobre la fluidez o validez del certificado

    @Column(
            name = "FechaRevision",
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRevision ;
}