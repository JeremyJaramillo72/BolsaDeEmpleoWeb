package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "catalogo_habilidad", schema = "catalogos")
public class CatalogoHabilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_habilidad")
    private Integer idHabilidad;

    @ManyToOne

    @JoinColumn(name="id_tipo_habilidad",nullable = false)
     private TipoHabilidad tipoHabilidad;

    @Size(min = 3,max =30,message = "No se permite nombre tan grande solo entre 3-50 caracteres.")
    @NotBlank(message = "Es obligatorio el nombre de la habilidad.")
    @Column(name = "nombre_habilidad")
    private String nombreHabilidad;
}
