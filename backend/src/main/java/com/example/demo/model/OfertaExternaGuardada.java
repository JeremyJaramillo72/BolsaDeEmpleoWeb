package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oferta_externa_guardada", schema = "ofertas")
public class OfertaExternaGuardada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oferta_externa")
    private Integer idOfertaExterna;

    @Column(name = "id_oferta_externa_origen", nullable = false, length = 200)
    private String externalOfferId;

    @Column(name = "titulo", length = 300)
    private String titulo;

    @Column(name = "nombre_empresa", length = 200)
    private String nombreEmpresa;

    @Column(name = "tipo_empleo", length = 80)
    private String tipoEmpleo;

    @Column(name = "ciudad", length = 120)
    private String ciudad;

    @Column(name = "estado", length = 120)
    private String estado;

    @Column(name = "pais", length = 120)
    private String pais;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Column(name = "fecha_publicacion", length = 80)
    private String fechaPublicacion;

    @Column(name = "url_aplicar", columnDefinition = "text")
    private String urlAplicar;

    @Column(name = "url_google", columnDefinition = "text")
    private String urlGoogle;

    @Column(name = "es_remoto")
    private Boolean esRemoto;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}

