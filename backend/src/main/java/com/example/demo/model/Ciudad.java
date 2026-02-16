package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ciudad", schema = "catalogos")
@Data
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ciudad")
    private Integer idCiudad;

    @Column(name = "nombre_ciudad", nullable = false, length = 100)
    private String nombreCiudad;

    // Relación: Muchas ciudades pertenecen a una provincia
    @ManyToOne
    @JoinColumn(name = "id_provincia") // Coincide con la columna en la BD
    private Provincia provincia;
}