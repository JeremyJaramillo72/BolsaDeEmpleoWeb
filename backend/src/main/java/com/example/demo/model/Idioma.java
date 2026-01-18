package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "idioma")
@Data
public class Idioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ididioma")
    private Integer idIdioma;

    @Column(name = "nombreidioma")
    private String nombreIdioma;
}