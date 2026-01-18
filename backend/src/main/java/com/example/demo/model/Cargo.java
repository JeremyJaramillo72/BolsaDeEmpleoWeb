package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "cargo")
@Data
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcargo")
    private Integer idCargo;

    @Column(name = "nombrecargo")
    private String nombreCargo;

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}