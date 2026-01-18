package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "explaboral")
@Data
public class ExpLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idexplaboral")
    private Integer idExpLaboral;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idcargo")
    private Cargo cargo;

    private String empresa;

    @Column(name = "fechainicio")
    private LocalDate fechaInicio;

    @Column(name = "fechafin")
    private LocalDate fechaFin;

    private String descripcion;
    private String ubicacion;

    @Column(name = "archivocomprobante")
    private byte[] archivoComprobante; // Para certificados de trabajo

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}