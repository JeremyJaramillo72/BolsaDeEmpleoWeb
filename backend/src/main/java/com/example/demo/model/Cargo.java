package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "cargo", schema = "catalogos")
@Data
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cargo")
    private Integer idCargo;

    @Column(
            name = "nombre_cargo",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(40)"
    )
    private String nombreCargo;

    @Column(
            name = "fecha_registro",
            nullable = false,
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRegistro ;
}