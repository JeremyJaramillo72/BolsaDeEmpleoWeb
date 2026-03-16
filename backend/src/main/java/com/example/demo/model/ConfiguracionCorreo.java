package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_correo", schema = "usuarios")
@Getter
@Setter
public class ConfiguracionCorreo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion")
    private Integer idConfiguracion;

    @Column(nullable = false, length = 50)
    private String tipo; // EMAIL_FROM

    @Column(nullable = false, length = 255)
    private String valor; // Email de la bolsa

    @Column(name = "password", length = 255)
    private String password; // App Password o contraseña

    @Column(nullable = false)
    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name = "id_usuario_modificado", nullable = true)
    private Usuario usuarioModificado; // Usuario admin que hizo el ÚLTIMO cambio

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
}
