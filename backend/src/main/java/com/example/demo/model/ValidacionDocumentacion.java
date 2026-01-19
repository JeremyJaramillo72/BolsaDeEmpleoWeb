package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "ValidacionDocumentacion")
@Data
public class ValidacionDocumentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdValidacionDoc")
    private Integer idValidacionDoc;

    @ManyToOne
    @JoinColumn(name = "IdPostulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne
    @JoinColumn(name = "IdDocumentacion", nullable = false)
    private DocumentacionAcademica documentacion;

    @Column(
            name = "EstadoValidacion",
            nullable = false,
            columnDefinition = "VARCHAR(20) DEFAULT 'Pendiente'"
    )
    private String estadoValidacion = "Pendiente"; // Ej: "Validado", "Rechazado", "Incompleto"

    @Column(name = "Observaciones", columnDefinition = "TEXT")
    private String observaciones; // Para detallar inconsistencias en el título o institución

    @Column(
            name = "FechaRevision",
            columnDefinition = "DATE DEFAULT CURRENT_DATE"
    )
    private LocalDate fechaRevision  ;
}