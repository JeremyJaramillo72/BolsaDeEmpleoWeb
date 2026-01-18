package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "Cargo")
@Data
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Idcargo")
    private Integer idCargo;

    @Column(
            name = "NombreCargo",
            nullable = false,
            unique = true,
            columnDefinition = "VARCHAR(40)"
    )
    private String nombreCargo;

    @Column(
            name = "FechaRegistro",
            nullable = false,
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRegistro ;
}