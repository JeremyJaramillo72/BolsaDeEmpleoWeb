package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "cursos", schema = "usuarios")
@Data
public class Cursos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curso")
    private Integer idCurso;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "nombre_curso", nullable = false, columnDefinition = "VARCHAR(100)")
    private String nombreCurso;

    @Column(name = "institucion", columnDefinition = "VARCHAR(100)")
    private String institucion;

    @Column(name = "hora_duracion", columnDefinition = "VARCHAR(5)")
    private String horaDuracion;

    @Column(name = "fecha_finalizacion", columnDefinition = "DATE")
    private LocalDate fechaFinalizacion;

    @Column(name = "archivo_certificado", columnDefinition = "TEXT")
    private String archivoCertificado;

    @Column(name = "fecha_registro", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaRegistro ;

    @NotNull(message = "El estado es obligatorio")
    @Column(name = "estado_registro")
    private String estadoRegistro;
}