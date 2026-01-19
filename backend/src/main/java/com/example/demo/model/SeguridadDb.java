package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "SeguridadDb")
@Data
public class SeguridadDb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdSeguridad")
    private Integer IdSeguridad;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @Column(name = "DbLoginName", columnDefinition = "VARCHAR(60)")
    private String dbLoginName; // Nombre de usuario en el sistema o BD

    @Column(name = "TipoAutenticacion", columnDefinition = "VARCHAR(30)")
    private String tipoAutenticacion;

    @Column(name = "UltimoAcceso", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime ultimoAcceso = LocalDateTime.now();
}