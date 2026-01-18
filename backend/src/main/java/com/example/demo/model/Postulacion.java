package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "postulacion")
@Data
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpostulacion")
    private Integer idPostulacion;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idoferta")
    private OfertaLaboral oferta;

    @Column(name = "estadopostulacion")
    private String estadoPost;

    @Column(name = "fechapostulacion")
    private LocalDate fechaPostulacion = LocalDate.now();
}