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


    @NotBlank(message = "El nombre de la empresa es obligatorio")
    @Size(max = 150, message = "El nombre de la empresa no puede exceder los 150 caracteres")
    @Column(name = "nombre_empresa", length = 150, nullable = false)
    private String nombreEmpresa;



    @Size(min = 10, max = 50, message = "El RUC debe tener entre 10 y 50 caracteres")
    @Column(name = "ruc", length = 50, nullable = false)
    private String ruc;


    @Column(name = "id_categoria")
    private Integer idCategoria;

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