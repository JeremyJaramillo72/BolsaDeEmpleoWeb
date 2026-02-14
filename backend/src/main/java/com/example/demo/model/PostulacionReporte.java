package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion")
@Data
public class PostulacionReporte {

    @Id
    @Column(name = "id_postulacion")
    private Long idPostulacion;

    @Column(name = "id_oferta")
    private Long idOferta;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "estado_validacion")
    private String estadoValidacion;

    @Column(name = "fecha_postulacion")
    private LocalDateTime fechaPostulacion;
}
