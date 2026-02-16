package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "provincia", schema = "catalogos")
@Data
public class Provincia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_provincia")
    private Integer idProvincia;

    @Column(name = "nombre_provincia", nullable = false, length = 100)
    private String nombreProvincia;
}