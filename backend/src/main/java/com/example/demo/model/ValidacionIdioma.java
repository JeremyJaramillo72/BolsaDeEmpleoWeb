package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "validacionidioma")
@Data
public class ValidacionIdioma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idvalidacionidioma")
    private Integer idValidacionIdioma;

    @ManyToOne
    @JoinColumn(name = "idpostulacion")
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "idusuarioidioma")
    private UsuarioIdioma usuarioIdioma;

    @Column(name = "estadovalidacion")
    private String estadoValidacion;

    private String observaciones;

    @Column(name = "fecharevision")
    private LocalDate fechaRevision = LocalDate.now();
}