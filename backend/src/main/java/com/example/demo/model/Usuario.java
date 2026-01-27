package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    // Sincronizado con id_rol de la BD
    @ManyToOne
    @JoinColumn(name = "id_rol")
    private Roles rol;

    // Sincronizado con id_ciudad de la BD
    @ManyToOne
    @JoinColumn(name = "id_ciudad")
    private Ciudad ciudad;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(nullable = false, length = 255)
    private String contrasena;

    @Column(length = 20)
    private String genero;

    // Mapeo exacto de fecha_nacimiento (date)
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    // Mapeo exacto de fecha_registro (timestamp)
    // insertable = false permite que la BD use el DEFAULT CURRENT_TIMESTAMP
    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;
}