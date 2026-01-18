package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validaciondocumentacion")
@Data
public class ValidacionDocumentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idvalidaciondoc")
    private Integer idValidacionDoc;

    @ManyToOne
    @JoinColumn(name = "idpostulacion")
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "iddocumentacion")
    private DocumentacionAcademica documentacion;

    @Column(name = "estadovalidacion")
    private String estadoValidacion;

    private String observaciones;

    @Column(name = "fecharevision")
    private LocalDate fechaRevision = LocalDate.now();
}