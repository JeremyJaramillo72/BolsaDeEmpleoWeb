package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "OfertasFavoritas")
@Data
public class OfertasFavoritas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdFavoritas")
    private Integer idFavoritas;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdOferta", nullable = false)
    private OfertaLaboral oferta;

    @Column(name = "EstadoFav", columnDefinition = "VARCHAR(20) DEFAULT 'Activo'")
    private String estadoFav; // Ej: "Activo", "Eliminado"

    // A esperas de lo q digan
   // @Column(name = "FechaAgregado", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
   // private LocalDateTime fechaAgregado ;
}