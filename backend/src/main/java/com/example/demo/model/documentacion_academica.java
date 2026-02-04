package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "documentacion_academica")
public class documentacion_academica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documentacion")
    private Integer idDocumentacion;

    @NotNull(message = "El perfil académico es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_academico", nullable = false)
    private PerfilAcademico perfilAcademico;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Lob // 👈 Indica que es un objeto pesado (Large Object)
    @Column(name = "archivo_titulo")
    private byte[] archivoTitulo; // 👈 Cambiado a byte[] para guardar el binario

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDate.now();
        }
    }
}