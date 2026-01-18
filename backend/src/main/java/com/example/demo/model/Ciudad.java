package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ciudad")
@Data
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idciudad")
    private Integer idCiudad;

    @Column(name = "nombreciudad")
    private String nombreCiudad;

    // Relación: Una Ciudad PROVIENE de una Provincia
    @ManyToOne
    @JoinColumn(name = "idprovincia")
    private Provincia provincia;
}