package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "oferta_laboral")
@Data
public class OfertaLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oferta")
    private Integer idOferta;

    // FK a Empresa
    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private UsuarioEmpresa empresa;

    // FK a Jornada
    @ManyToOne
    @JoinColumn(name = "id_jornada")
    private JornadaOferta jornada;

    // FK a Modalidad
    @ManyToOne
    @JoinColumn(name = "id_modalidad")
    private ModalidadOferta modalidad;

    // FK a Categoría (La que faltaba)
    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private CategoriaOferta categoria;

    @ManyToOne
    @JoinColumn(name = "idciudad")
    private Ciudad ciudad;

    private String titulo; // Agregué título que suele ser necesario
    private String descripcion;
    private String requisitos;
    
    @Column(name = "tipocontrato")
    private String tipoContrato;
    
    @Column(name = "sueldopromedio")
    private Double sueldoPromedio;

    @Column(name = "fechapublicacion")
    private LocalDate fechaPublicacion = LocalDate.now();

    @Column(name = "fechacierre")
    private LocalDate fechaCierre;

    @Column(name = "estadoofertalaboral")
    private String estado = "Activa";
}