package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguridad", schema = "public") // Nombre exacto de tu tabla
@Data
public class Seguridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguridad")
    private Integer idSeguridad;

    @ManyToOne
    @JoinColumn(name = "id_usuario") // Coincide con id_usuario de tu SQL
    private Usuario usuario;

    @Column(name = "login_name", length = 100) // Coincide con character varying(100)
    private String loginName;

    @Column(name = "clave_name", length = 150) // Coincide con character varying(150)
    private String claveName;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso = LocalDateTime.now();
}