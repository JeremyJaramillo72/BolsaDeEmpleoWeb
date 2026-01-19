package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "Cursos")
@Data
public class Cursos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCurso")
    private Integer idCurso;

    @ManyToOne
    @JoinColumn(name = "IdUsuario")
    private Usuario usuario;

    @Column(name = "NombreCurso", nullable = false, columnDefinition = "VARCHAR(100)")
    private String nombreCurso;

    @Column(name = "Institucion", columnDefinition = "VARCHAR(100)")
    private String institucion;

    @Column(name = "HoraDuracion", columnDefinition = "VARCHAR(5)") // por si dejan la h , 40h, 3.5h,
    private String horaDuracion;

    @Column(name = "FechaFinalizacion", columnDefinition = "DATE")
    private LocalDate fechaFinalizacion;

    @Column(name = "ArchivoCertificado", columnDefinition = "TEXT")
    private String archivoCertificado; // URL de Drive/Cloudinary del PDF o imagen

    @Column(name = "FechaRegistro", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaRegistro ;
}