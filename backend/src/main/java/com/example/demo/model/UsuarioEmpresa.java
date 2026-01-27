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

    // Relación Uno a Uno según el diagrama ER
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", unique = true)
    private Usuario usuario;

    // Usamos columnDefinition = "TEXT" porque en tu SQL es tipo 'text'
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(unique = true, length = 20)
    private String ruc;

    @Column(name = "sitioweb", length = 100)
    private String sitioWeb;

    // Sincronizado con fecha_registro timestamp
    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;
}