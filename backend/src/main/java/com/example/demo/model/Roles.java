package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles" , schema = "usuarios")
@Data
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(
            name = "nombre_rol",
            nullable = false,
            length = 50
    )
    private String nombreRol;

    // ¡NUEVO CAMPO AQUÍ!
    // Aquí se guardarán los textos como "CATALOGOS,REPORTES"
    @Column(name = "permisos_ui", length = 500)
    private String permisosUi;

    @Column(name = "id_rol_bd", length = 100)
    private String idRolBd;
}