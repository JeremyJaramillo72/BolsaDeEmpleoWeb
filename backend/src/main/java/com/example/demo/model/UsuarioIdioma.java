package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarioidioma")
@Data
public class UsuarioIdioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuarioidioma")
    private Integer idUsuarioIdioma;

    @ManyToOne
    @JoinColumn(name = "ididioma")
    private Idioma idioma;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    private String nivel;

    @Column(name = "archivocertificado")
    private byte[] archivoCertificado; // Tipo Byte según tu diagrama

    @Column(name = "codigocertificado")
    private String codigoCertificado;
}