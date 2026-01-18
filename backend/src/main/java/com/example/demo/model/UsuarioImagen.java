package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "usuarioimagen")
@Data
public class UsuarioImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuarioimagen")
    private Integer idUsuarioImagen;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idimagen")
    private Imagen imagen;

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}