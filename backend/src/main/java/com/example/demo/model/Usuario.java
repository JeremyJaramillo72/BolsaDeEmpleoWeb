package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "usuario")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

   @ManyToOne
    @JoinColumn(name = "idrol") 
    private Roles rol;

    // Relación con Ciudad
    @ManyToOne
    @JoinColumn(name = "idciudad")
    private Ciudad ciudad;


    private String nombre;
    private String apellido;
    private String telefono;
    
    @Column(unique = true)
    private String correo;
    
    private String contrasena; 
    private String genero;

    @Column(name = "fechanacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "fecharegistro")
    private LocalDate fechaRegistro = LocalDate.now();
}