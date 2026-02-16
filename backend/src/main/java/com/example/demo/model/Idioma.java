package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "idioma", schema = "catalogos")
@Data
public class Idioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_idioma")
    private Integer idIdioma;

    @Column(
            name = "nombre_idioma",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(15)"
    )
    private String nombreIdioma;
}