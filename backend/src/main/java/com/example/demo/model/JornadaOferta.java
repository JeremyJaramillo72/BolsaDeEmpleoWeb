package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "jornada_oferta", schema = "catalogos")
@Data
public class JornadaOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jornada")
    private Integer idJornada;

    @Column(
            name = "nombre_jornada",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(30)"
    )
    private String nombreJornada;
}