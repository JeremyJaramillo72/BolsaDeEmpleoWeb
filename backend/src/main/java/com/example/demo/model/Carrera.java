package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name = "carrera", schema = "catalogos")
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrera")
    private Integer idCarrera;

    @NotNull(message = "La facultad es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER) // Eager para traer el nombre de la facultad al consultar la carrera
    @JoinColumn(name = "id_facultad", nullable = false)
    private Facultad facultad;

    @NotBlank(message = "El nombre de la carrera es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
    @Column(name = "nombre_carrera", length = 150, nullable = false)
    private String nombreCarrera;
}