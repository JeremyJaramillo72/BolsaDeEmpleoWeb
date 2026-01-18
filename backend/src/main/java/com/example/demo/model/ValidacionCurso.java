package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validacioncurso")
@Data
public class ValidacionCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idvalidacioncurso")
    private Integer idValidacionCurso;

    @ManyToOne
    @JoinColumn(name = "idpostulacion")
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "idcurso")
    private Cursos curso;

    @Column(name = "estadovalidacion")
    private String estadoValidacion;

    private String observaciones;

    @Column(name = "fecharevision")
    private LocalDate fechaRevision = LocalDate.now();
}