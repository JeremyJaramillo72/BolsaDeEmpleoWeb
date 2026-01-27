package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles") // Cambiado a minúsculas para coincidir con la BD
@Data
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol") // Coincide con id_rol de la BD
    private Integer idRol;

    @Column(
            name = "nombre_rol", // Coincide con nombre_rol de la BD
            nullable = false,
            length = 50 // Sincronizado con character varying(50)
    )
    private String nombreRol;
}