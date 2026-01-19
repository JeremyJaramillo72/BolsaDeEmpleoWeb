package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "ValidacionExpLaboral")
@Data
public class ValidacionExpLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdValidacionExp")
    private Integer idValidacionExp;

    @ManyToOne
    @JoinColumn(name = "IdPostulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "IdExpLaboral", nullable = false)
    private ExpLaboral expLaboral;

    @Column(
            name = "EstadoValidacion",
            nullable = false,
            columnDefinition = "VARCHAR(30) DEFAULT 'Pendiente'"
    )
    private String estadoValidacion = "Pendiente"; // Ej: "Verificada", "Rechazada", "En Verificación"

    @Column(name = "Observaciones", columnDefinition = "TEXT")
    private String observaciones; // Detalle de por qué se acepta o rechaza la experiencia

    @Column(
            name = "FechaRevision",
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRevision  ;
}