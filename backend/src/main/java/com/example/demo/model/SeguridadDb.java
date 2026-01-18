package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "seguridaddb")
@Data
public class SeguridadDb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pkidseguridad")
    private Integer pkIdSeguridad;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @Column(name = "dbloginname")
    private String dbLoginName;

    @Column(name = "tipoautenticacion")
    private String tipoAutenticacion;

    @Column(name = "ultimoacceso")
    private LocalDate ultimoAcceso;
}