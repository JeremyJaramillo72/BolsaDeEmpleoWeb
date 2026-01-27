package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validacion_curso")
@Data
public class ValidacionCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion_curso")
    private Integer idValidacionCurso;

    @ManyToOne
    @JoinColumn(name = "id_postulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "id_curso", nullable = false)
    private Cursos curso;

    @Column(
            name = "estado_validacion",
            nullable = false,
            columnDefinition = "VARCHAR(15) DEFAULT 'Pendiente'"
    )
    private String estadoValidacion = "Pendiente"; // Ej: "Aprobado", "Rechazado", "Pendiente"

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones; // TEXT para detallar por qué se aprobó o rechazó

    @Column(
            name = "fecha_revision",
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRevision  ;
}