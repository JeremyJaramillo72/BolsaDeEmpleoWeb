package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuario_empresa")
@Data
public class UsuarioEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long idEmpresa;

    // --- CAMBIO CLAVE: Relación Uno a Uno ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", unique = true)
    private Usuario usuario;

    @Column(name = "nombreempresa")
    private String nombreEmpresa;

    private String descripcion;

    @Column(name = "sitioweb")
    private String sitioWeb;

    private String ruc;
}