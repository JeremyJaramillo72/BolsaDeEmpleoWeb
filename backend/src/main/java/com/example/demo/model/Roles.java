package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Roles")
@Data
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRol")
    private Integer idRol;

    @Column(
            name = "NombreRol",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(15)"
    )
    private String nombreRol;
}