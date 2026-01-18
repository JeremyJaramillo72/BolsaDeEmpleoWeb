package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Idioma")
@Data
public class Idioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdIdioma")
    private Integer idIdioma;

    @Column(
            name = "NombreIdioma",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(15)"
    )
    private String nombreIdioma;
}