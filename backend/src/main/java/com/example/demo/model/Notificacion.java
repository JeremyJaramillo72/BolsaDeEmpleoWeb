package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion", schema = "usuarios")
@Data
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Integer idNotificacion;

    // Relación: Una notificación pertenece a un Usuario
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(length = 50)
    private String tipo;

    @Column(length = 255)
    private String enlace;

    @Column(nullable = false)
    private Boolean leido = false;

    // Se usa insertable = false para que la BD aplique el DEFAULT CURRENT_TIMESTAMP
    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}