package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "ofertas_favoritas", schema = "ofertas")
public class OfertasFavoritas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_favoritas")
    private Integer idFavoritas;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_oferta", nullable = false)
    private OfertaLaboral oferta;

    @Column(name = "origen_oferta", length = 20)
    private String origenOferta;

    @Column(name = "estado_fav", length = 20)
    private String estadoFav;

    @Column(name = "fecha_agregado")
    private LocalDate fecha; // o LocalDateTime, Date, etc.

    // a espera de lo que digan
    // @Column(name = "fecha_agregado")
    // private LocalDateTime fechaAgregado;

    @PrePersist
    public void prePersist() {
        if (this.estadoFav == null) {
            this.estadoFav = "Activo";
        }
        if (this.origenOferta == null) {
            this.origenOferta = "Interna";
        }
        // if (this.fechaAgregado == null) this.fechaAgregado = LocalDateTime.now();
    }
}