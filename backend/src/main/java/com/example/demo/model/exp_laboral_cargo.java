package com.example.demo.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Entity
@Table(name = "exp_laboral_cargo", schema = "usuarios")
@Data
public class exp_laboral_cargo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exp_cargo")
    private Integer idExpCargo;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_exp_laboral", nullable = false)
    private exp_laboral expLaboral;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cargo", nullable = false)
    private Cargo cargo;

    @NotNull(message = "El estado es obligatorio")
    @Column(name = "estado_registro")
    private String estadoRegistro;
}
