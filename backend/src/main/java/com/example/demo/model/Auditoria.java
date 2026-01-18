package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Data
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idauditoria")
    private Integer idAuditoria;

    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @Column(name = "fechahora")
    private LocalDateTime fechaHora = LocalDateTime.now();

    private String accion;

    @Column(name = "tablaafectada")
    private String tablaAfectada;

    @Column(name = "idregistroafectado")
    private Integer idRegistroAfectado;

    @Column(name = "detallecambio")
    private String detalleCambio;
}