package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "UsuarioImagen")
@Data
public class UsuarioImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuarioImagen")
    private Integer idUsuarioImagen;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdImagen", nullable = false)
    private Imagen imagen;

    // a esperas
    // @Column(name = "TipoImagen", columnDefinition = "VARCHAR(30)")
   //  private String tipoImagen; // Ej: "PERFIL", "PORTADA"

    @Column(name = "FechaRegistro", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaRegistro;
}