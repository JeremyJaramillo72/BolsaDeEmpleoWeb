package com.example.demo.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name = "facultad", schema = "catalogos")
public class Facultad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_facultad")
    private Integer idFacultad;

    @NotBlank(message = "El nombre de la facultad es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
    @Column(name = "nombre_facultad", length = 150, nullable = false)
    private String nombreFacultad;
}