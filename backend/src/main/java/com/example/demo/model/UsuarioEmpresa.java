package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_empresa")
@Data
public class UsuarioEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long idEmpresa;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", unique = true)
    private Usuario usuario;


    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(unique = true, length = 20)
    private String ruc;

    @Column(name = "sitioweb", length = 100)
    private String sitioWeb;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void CrearFecha(){
        this.fechaRegistro=LocalDateTime.now();
    }

}