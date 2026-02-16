package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exp_laboral", schema = "usuarios")
@Data
public class exp_laboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exp_laboral")
    private Integer idExpLaboral;


    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY) // Lazy es mejor para rendimiento
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @NotNull(message = "El cargo es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER) // Eager para mostrar el nombre del cargo en el frontend
    @JoinColumn(name = "id_cargo", nullable = false)
    private Cargo cargo;

    @NotNull(message = "La empresa es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER) // Eager para mostrar el nombre de la empresa
    @JoinColumn(name = "id_empresa_catalogo", nullable = false)
    private CatalogoEmpresa catalogoEmpresa;


    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 100, message = "La ubicación no puede exceder los 100 caracteres")
    @Column(name = "ubicacion", length = 100)
    private String ubicacion;

    @Column(name = "archivo_comprobante", columnDefinition = "TEXT")
    private String archivoComprobante;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}