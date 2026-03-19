package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "requisito_manual", schema = "ofertas")
public class RequisitoManual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_requisito_manual")
    private Integer idRequisitoManual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_oferta",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_manual_oferta")
    )
    private OfertaLaboral oferta;

    @NotBlank(message = "La descripción del requisito es obligatoria")
    @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "es_obligatorio")
    private Boolean esObligatorio;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) this.fechaRegistro = LocalDateTime.now();

        if (this.esObligatorio == null) this.esObligatorio = true;
    }
}