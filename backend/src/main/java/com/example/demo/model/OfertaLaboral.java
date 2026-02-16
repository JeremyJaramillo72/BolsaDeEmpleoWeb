package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oferta_laboral", schema = "ofertas")
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


    @NotNull(message = "El numero de vacantes es obligatorio")
    @Size(max =5000)
    @Column (name="cantidad_vacantes",nullable = false)
    private Integer cantidadVacantes;


    @NotNull(message = "La experiencia minima es obligatoria")
    @Size(max =100)
    @Column (name="experiencia_minima",nullable = false)
    private Integer experienciaMinima;

    @NotNull(message = "El salario minima es obligatorio")
    @Column (name="salario_min",nullable = false)
    @Size(max = 900000)
    private BigDecimal salarioMin;

    @NotNull(message = "El salario maximo es obligatorio")
    @Column (name="salario_max",nullable = false)
    @Size(max = 900000)
    private BigDecimal salarioMax;

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