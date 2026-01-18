package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "modalidad_oferta")
@Data
public class ModalidadOferta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modalidad")
    private Integer idModalidad;

    @Column(name = "nombremodalidad")
    private String nombremodalidad;
}