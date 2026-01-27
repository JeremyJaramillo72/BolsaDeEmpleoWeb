package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguridad_db")
@Data
public class SeguridadDb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguridad")
    private Integer IdSeguridad;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "db_login_name", columnDefinition = "VARCHAR(60)")
    private String dbLoginName; // Nombre de usuario en el sistema o BD

    @Column(name = "tipo_autenticacion", columnDefinition = "VARCHAR(30)")
    private String tipoAutenticacion;

    @Column(name = "ultimo_acceso", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime ultimoAcceso = LocalDateTime.now();
}