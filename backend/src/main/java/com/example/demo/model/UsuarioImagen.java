package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_imagen", schema = "usuarios")
@Data
public class UsuarioImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_imagen")
    private Integer idUsuarioImagen;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_imagen", nullable = false)
    private Imagen imagen;

    // a esperas
    // @Column(name = "TipoImagen", columnDefinition = "VARCHAR(30)")
   //  private String tipoImagen; // Ej: "PERFIL", "PORTADA"

    @Column(name = "fecha_registro", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaRegistro;
}