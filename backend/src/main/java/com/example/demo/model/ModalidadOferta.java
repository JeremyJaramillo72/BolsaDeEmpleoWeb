package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ModalidadOferta")
@Data
public class ModalidadOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdModalidad")
    private Integer idModalidad;

    @Column(
            name = "NombreModalidad",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(10)"
    )
    private String nombreModalidad;
}