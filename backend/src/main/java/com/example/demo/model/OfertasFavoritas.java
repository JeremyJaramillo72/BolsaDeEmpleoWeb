package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    @ManyToOne
    @JoinColumn(name = "id_oferta", nullable = false)
    private OfertaLaboral oferta;

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
        // if (this.fechaAgregado == null) this.fechaAgregado = LocalDateTime.now();
    }
}