package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "catalogo_empresa", schema = "empresas")
public class CatalogoEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa_catalogo")
    private Integer idEmpresaCatalogo;

    // Validación según imagen: varchar(150)
    @NotBlank(message = "El nombre de la empresa es obligatorio")
    @Size(max = 150, message = "El nombre de la empresa no puede exceder los 150 caracteres")
    @Column(name = "nombre_empresa", length = 150, nullable = false)
    private String nombreEmpresa;

    // Validación según imagen: varchar(50)
    @NotBlank(message = "El RUC es obligatorio")
    @Size(min = 10, max = 50, message = "El RUC debe tener entre 10 y 50 caracteres")
    @Column(name = "ruc", length = 50, nullable = false)
    private String ruc;

    // Validación según imagen: varchar(100)
    @NotBlank(message = "El sector es obligatorio")
    @Size(max = 100, message = "El sector no puede exceder los 100 caracteres")
    @Column(name = "sector", length = 100)
    private String sector;

    @Column(name = "es_verificada")
    private Boolean esVerificada;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) this.fechaRegistro = LocalDateTime.now();
        if (this.esVerificada == null) this.esVerificada = false;
    }
}