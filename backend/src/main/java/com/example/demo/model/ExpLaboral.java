package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "ExpLaboral")
@Data
public class ExpLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdExpLaboral")
    private Integer idExpLaboral;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdCargo", nullable = false)
    private Cargo cargo;

    @Column(name = "Empresa", nullable = false, columnDefinition = "VARCHAR(70)")
    private String empresa;

    @Column(name = "FechaInicio", nullable = false, columnDefinition = "DATE")
    private LocalDate fechaInicio;

    @Column(name = "FechaFin", columnDefinition = "DATE")
    private LocalDate fechaFin;

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion; // TEXT es vital aquí para detallar funciones y logros

    @Column(name = "Ubicacion", columnDefinition = "VARCHAR(80)")
    private String ubicacion; // Ciudad, País (Ej: "Quito, Ecuador")

    @Column(name = "ArchivoComprobante", columnDefinition = "TEXT")
    private String archivoComprobante; // URL de Drive/Cloud para el certificado laboral

    @Column(name = "FechaRegistro", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaRegistro ;
}