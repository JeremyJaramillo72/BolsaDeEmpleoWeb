package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "cursos")
@Data
public class Cursos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcurso")
    private Integer idCurso;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @Column(name = "nombrecurso")
    private String nombreCurso;

    private String institucion;

    @Column(name = "horaduracion")
    private String horaDuracion;

    @Column(name = "fechafinalizacion")
    private LocalDate fechaFinalizacion;

    @Column(name = "archivocertificado")
    private byte[] archivoCertificado;

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}