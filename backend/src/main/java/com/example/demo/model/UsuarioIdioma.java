package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "UsuarioIdioma")
@Data
public class UsuarioIdioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuarioIdioma")
    private Integer idUsuarioIdioma;

    @ManyToOne
    @JoinColumn(name = "IdIdioma", nullable = false)
    private Idioma idioma;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @Column(name = "Nivel", nullable = false, columnDefinition = "VARCHAR(30)")
    private String nivel; // Ej: "A2 - Básico", "B2 - Intermedio", "C1 - Avanzado"

    @Column(name = "ArchivoCertificado", columnDefinition = "TEXT")
    private String archivoCertificado; // URL de Drive/S3 con el PDF del certificado

    @Column(name = "CodigoCertificado", columnDefinition = "VARCHAR(50)")
    private String codigoCertificado; // Código de verificación del examen (ej. TOEFL ID)
}