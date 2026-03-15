package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sistema_empresa", schema = "seguridad")
public class SistemaEmpresa {

    @Id
    @Column(name = "id_config")
    private Integer idConfig;

    @Column(name = "nombre_aplicativo", nullable = false, length = 150)
    private String nombreAplicativo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "correo_soporte", length = 150)
    private String correoSoporte;

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    @Column(name = "direccion_institucion", length = 255)
    private String direccionInstitucion;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}