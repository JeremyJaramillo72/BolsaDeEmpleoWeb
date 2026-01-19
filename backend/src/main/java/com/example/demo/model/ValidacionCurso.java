package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "ValidacionCurso")
@Data
public class ValidacionCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdValidacionCurso")
    private Integer idValidacionCurso;

    @ManyToOne
    @JoinColumn(name = "IdPostulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "IdCurso", nullable = false)
    private Cursos curso;

    @Column(
            name = "EstadoValidacion",
            nullable = false,
            columnDefinition = "VARCHAR(15) DEFAULT 'Pendiente'"
    )
    private String estadoValidacion = "Pendiente"; // Ej: "Aprobado", "Rechazado", "Pendiente"

    @Column(name = "Observaciones", columnDefinition = "TEXT")
    private String observaciones; // TEXT para detallar por qué se aprobó o rechazó

    @Column(
            name = "FechaRevision",
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRevision  ;
}