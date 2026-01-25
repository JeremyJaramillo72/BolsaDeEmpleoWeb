package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Auditoria")
@Data
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAuditoria")
    private Integer idAuditoria;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @Column(name = "FechaHora", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaHora = LocalDateTime.now();

    @Column(name = "Accion",nullable = false, columnDefinition = "VARCHAR(50)")
    private String accion;

    @Column(name = "TablaAfectada",nullable = false, columnDefinition = "VARCHAR(40)") //Le dejé 40
    private String tablaAfectada;

    @Column(name = "IdRegistroAfectado", nullable = false)
    private Integer idRegistroAfectado;

    @Column(name = "DetalleCambio",  nullable = false, columnDefinition = "VARCHAR(50)")
    private String detalleCambio;
}