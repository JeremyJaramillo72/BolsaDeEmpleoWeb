package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.springframework.security.core.authority.mapping.NullAuthoritiesMapper;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "oferta_habilidad_seleccionada", schema = "ofertas")
public class OfertaHabilidadSeleccionada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oferta_habilidad")
    private Integer idOfertaHabilidad;

    @ManyToOne
    @JoinColumn (name = "id_oferta",nullable = false)
    private OfertaLaboral OfertaId;

    @ManyToOne
    @JoinColumn(name = "id_habilidad")
    private CatalogoHabilidad HabilidadId;

    @NotBlank(message = "Es obligatorio ingreasr el nivel requerido.")
    @Size(min = 3,max = 50,message = "Necesita colocar un nivel de requisito entre 3-50 caracteres")
    @Column(name = "nivel_requerido")
    private String nivelRequerido;

    @NonNull
    @Column(name = "es_obligatorio")
    private Boolean esObligatorio;
}
