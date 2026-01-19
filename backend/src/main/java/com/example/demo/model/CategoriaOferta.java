package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "CategoriaOferta")
@Data
public class CategoriaOferta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCategoria")
    private Integer idCategoria;

    @Column(name = "NombreCategoria" ,
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(40)")
    private String nombrecategoria;
}