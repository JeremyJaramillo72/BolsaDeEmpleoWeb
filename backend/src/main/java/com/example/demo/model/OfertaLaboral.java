package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oferta_laboral", schema = "public")
// AGREGAMOS ESTA ANOTACIÓN PARA REGISTRAR EL PROCEDURE
@NamedStoredProcedureQuery(
        name = "OfertaLaboral.obtenerMayorSalario",
        procedureName = "sp_ObtenerOfertaMayorSalario",
        parameters = {
                @StoredProcedureParameter(mode = ParameterMode.IN, name = "pid_empresa", type = Integer.class),
                @StoredProcedureParameter(mode = ParameterMode.OUT, name = "p_oferta_nombre", type = String.class),
                @StoredProcedureParameter(mode = ParameterMode.OUT, name = "p_detalles", type = String.class)
        }
)
public class OfertaLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oferta")
    private Integer idOferta;

    @NotNull(message = "La empresa es obligatoria")
    @ManyToOne
    @JoinColumn(name = "id_empresa", nullable = false)
    private UsuarioEmpresa empresa;

    @NotNull(message = "La modalidad es obligatoria")
    @ManyToOne
    @JoinColumn(name = "id_modalidad", nullable = false)
    private ModalidadOferta modalidad;

    @NotNull(message = "La categoría es obligatoria")
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private CategoriaOferta categoria;

    @NotNull(message = "La jornada es obligatoria")
    @ManyToOne
    @JoinColumn(name = "id_jornada", nullable = false)
    private JornadaOferta jornada;

    @NotNull(message = "La ciudad es obligatoria")
    @ManyToOne
    @JoinColumn(name = "id_ciudad", nullable = false)
    private Ciudad ciudad;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150)
    @Column(name = "titulo", length = 150, nullable = false)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "salario_promedio", precision = 10, scale = 2)
    private BigDecimal salarioPromedio;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;

    @Column(name = "estado_oferta", length = 20)
    private String estadoOferta;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estadoOferta == null) {
            this.estadoOferta = "Activa";
        }
    }
}