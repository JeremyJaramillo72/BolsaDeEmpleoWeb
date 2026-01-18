package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "DocumentacionAcademica")
@Data
public class DocumentacionAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdDocumentacion")
    private Integer idDocumentacion;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @Column(name = "TituloAcademico", nullable = false, columnDefinition = "VARCHAR(150)")
    private String tituloAcademico;

    @Column(name = "Institucion", columnDefinition = "VARCHAR(100)")
    private String institucion;

    @Column(name = "AnioGraduacion", columnDefinition = "INTEGER")
    private Integer anioGraduacion; // el año (4 dígitos) no requiere más que un Integer

    @Column(name = "NivelEstudios", columnDefinition = "VARCHAR(20)")
    private String nivelEstudios;

    @Column(name = "ArchivoTitulo", columnDefinition = "TEXT")
    private String archivoTitulo; // Cambiado de byte[] a URL por eficiencia

    @Column(name = "FechaRegistro", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaRegistro ;
}