package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "imagen")
@Data
public class Imagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen")
    private Integer idImagen;

    @Column(name = "url_imagen", nullable = false, columnDefinition = "TEXT")
    private String urlImagen; // Aquí va el link de Drive/S3
}