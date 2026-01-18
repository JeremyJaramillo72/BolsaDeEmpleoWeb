package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "documentacionacademica")
@Data
public class DocumentacionAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iddocumentacion")
    private Integer idDocumentacion;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @Column(name = "tituloacademico")
    private String tituloAcademico;

    private String institucion;

    @Column(name = "anograduacion")
    private Integer anoGraduacion;

    @Column(name = "nivelestudios")
    private String nivelEstudios;

    @Column(name = "archivotitulo")
    private byte[] archivoTitulo; // Guardado como binario

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}