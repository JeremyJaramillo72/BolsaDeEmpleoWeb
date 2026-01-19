package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "OfertaLaboral")
@Data
public class OfertaLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdOferta")
    private Integer idOferta;

    // FK a Empresa
    @ManyToOne
    @JoinColumn(name = "IdEmpresa", nullable = false)
    private UsuarioEmpresa empresa;

    // FK a Jornada
    @ManyToOne
    @JoinColumn(name = "IdJornada", nullable = false)
    private JornadaOferta jornada;

    // FK a Modalidad
    @ManyToOne
    @JoinColumn(name = "IdModalidad", nullable = false)
    private ModalidadOferta modalidad;

    // FK a Categoría (La que faltaba)
    @ManyToOne
    @JoinColumn(name = "IdCategoria", nullable = false)
    private CategoriaOferta categoria;

    @ManyToOne
    @JoinColumn(name = "IdCiudad", nullable = false)
    private Ciudad ciudad;

    @Column(name = "Titulo", nullable = false, columnDefinition = "VARCHAR(150)")
    private String titulo; // Agregué título que suele ser necesario

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion; // TEXT para no limitar el detalle de la oferta

    @Column(name = "Requisitos", columnDefinition = "TEXT")
    private String requisitos; // TEXT para listas largas de habilidades requeridas

    @Column(name = "TipoContrato",nullable = false, columnDefinition = "VARCHAR(20)")
    private String tipoContrato; // Ej: "Indefinido", "Temporal"

    @Column(name = "SueldoPromedio", columnDefinition = "DECIMAL(10,2)")
    private Double sueldoPromedio;

    @Column(name = "FechaPublicacion", columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaPublicacion ;

    @Column(name = "FechaCierre", columnDefinition = "DATE")
    private LocalDate fechaCierre;

    @Column(name = "EstadoOfertaLaboral", columnDefinition = "VARCHAR(12) DEFAULT 'Activa'")
    private String estado;
}