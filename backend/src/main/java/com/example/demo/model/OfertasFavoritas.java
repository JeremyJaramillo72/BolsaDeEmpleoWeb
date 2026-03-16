package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;
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

    @Column(name = "id_oferta", nullable = false)
    private Integer idOferta;

    @Column(name = "origen_oferta", length = 20)
    private String origenOferta;

    @Column(name = "estado_fav", length = 20)
    private String estadoFav;

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