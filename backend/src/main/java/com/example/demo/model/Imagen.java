package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Imagen")
@Data
public class Imagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdImagen")
    private Integer idImagen;

    @Column(name = "UrlImagen", nullable = false, columnDefinition = "TEXT")
    private String urlImagen; // Aquí va el link de Drive/S3
}