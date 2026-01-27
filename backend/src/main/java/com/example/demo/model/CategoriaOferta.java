package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categoria_oferta")
@Data
public class CategoriaOferta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;

    @Column(name = "nombre_categoria" ,
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(40)")
    private String nombrecategoria;
}