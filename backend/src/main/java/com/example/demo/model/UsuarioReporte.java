package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuario")
@Data
public class UsuarioReporte {

    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;
}
