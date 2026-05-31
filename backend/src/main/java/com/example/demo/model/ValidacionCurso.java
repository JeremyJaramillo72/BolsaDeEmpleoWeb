package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validacion_curso", schema = "postulaciones")
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

    @Column(name = "estado_validacion", nullable = false, length = 15)
    private String estadoValidacion = "Pendiente";

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_revision")
    private LocalDate fechaRevision;
}