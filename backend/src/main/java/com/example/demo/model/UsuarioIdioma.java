package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Usuario_idioma", schema = "usuarios")
@Data
public class UsuarioIdioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_idioma")
    private Integer idUsuarioIdioma;

    @ManyToOne
    @JoinColumn(name = "id_idioma", nullable = false)
    private Idioma idioma;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "nivel", nullable = false, columnDefinition = "VARCHAR(30)")
    private String nivel; // Ej: "A2 - Básico", "B2 - Intermedio", "C1 - Avanzado"

    @Column(name = "archivo_certificado", length = 500)
    private String archivoCertificado; // URL de Cloudinary

    @Column(name = "codigo_certificado", columnDefinition = "VARCHAR(50)")
    private String codigoCertificado; // Código de verificación del examen (ej. TOEFL ID)
}