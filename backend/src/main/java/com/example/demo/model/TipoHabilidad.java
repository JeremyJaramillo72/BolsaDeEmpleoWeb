package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import lombok.ToString;

import java.security.PrivateKey;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tipo_habilidad", schema = "catalogos")
public class TipoHabilidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY )
    @Column(name = "id_tipo_habilidad")
    private Integer idTipoHabilidad;

    @NotBlank(message = "El nombre del tipo de habilidad es obligatorio.")
    @Size(min = 3, max = 50, message = "El nombre debe tener un total de caracteres entre 3-50.")
    @Column (name = "nombre_tipo", nullable = false, length = 50, unique = true)
    private String nombreTipo;


    @Size(max = 255,message = "No se permite mas caracteres.")
    @Column (name = "descripcion")
    private String descripcion;

    @OneToMany(mappedBy = "tipoHabilidad",cascade=CascadeType.ALL)
    @ToString.Exclude
    private List<CatalogoHabilidad> habilidades;
}

