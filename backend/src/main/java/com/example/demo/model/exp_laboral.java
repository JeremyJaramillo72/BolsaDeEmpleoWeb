package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exp_laboral", schema = "usuarios")
@Data
public class exp_laboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exp_laboral")
    private Integer idExpLaboral;


    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "expLaboral", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<exp_laboral_cargo> cargosAsignados;

    @NotNull(message = "La empresa es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empresa_catalogo", nullable = false)
    private CatalogoEmpresa catalogoEmpresa;


    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotNull(message = "La ciudad es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ciudad")
    private Ciudad ciudad;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;



    @Column(name = "archivo_comprobante", columnDefinition = "TEXT")
    private String archivoComprobante;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;


    @NotNull(message = "El estado es obligatorio")
    @Column(name = "estado_registro")
    private String estadoRegistro;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}