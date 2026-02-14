package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "oferta_laboral")
@Data
public class OfertaReporte {

    @Id
    @Column(name = "id_oferta")
    private Long idOferta;
}
