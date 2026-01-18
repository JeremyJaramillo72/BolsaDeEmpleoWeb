package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ofertasfavoritas")
@Data
public class OfertasFavoritas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idfavoritas")
    private Integer idFavoritas;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idoferta")
    private OfertaLaboral oferta;

    @Column(name = "estadofav")
    private String estadoFav;
}