package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "JornadaOferta")
@Data
public class JornadaOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdJornada")
    private Integer idJornada;

    @Column(
            name = "NombreJornada",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(30)"
    )
    private String nombreJornada;
}