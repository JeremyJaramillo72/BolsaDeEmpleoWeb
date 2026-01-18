package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validacionexplaboral")
@Data
public class ValidacionExpLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idvalidacionexp")
    private Integer idValidacionExp;

    @ManyToOne
    @JoinColumn(name = "idpostulacion") // Conecta con la postulación realizada
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "idexplaboral")
    private ExpLaboral expLaboral;

    @Column(name = "estadovalidacion")
    private String estadoValidacion;

    private String observaciones;

    @Column(name = "fecharevision")
    private LocalDate fechaRevision = LocalDate.now();
}