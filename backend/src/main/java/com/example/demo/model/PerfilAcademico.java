package com.example.demo.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "perfil_academico", schema = "public")
public class PerfilAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil_academico")
    private Integer idPerfilAcademico;
    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @NotNull(message = "La carrera es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_carrera", nullable = false)
    private Carrera carrera;

    @Column(name = "fecha_graduacion")
    private LocalDate fechaGraduacion;

    @Size(max = 50, message = "El número de registro no puede exceder los 50 caracteres")
    @Column(name = "numero_registro_senescyt", length = 50)
    private String numeroRegistroSenescyt;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}