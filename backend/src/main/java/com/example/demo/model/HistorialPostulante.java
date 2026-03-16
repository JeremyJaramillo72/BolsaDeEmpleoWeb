package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "historial_postulante", schema = "usuarios")
public class HistorialPostulante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @Column(name = "id_perfil_academico", nullable = false)
    private Integer idPerfilAcademico;

    @Column(name = "id_seguridad")
    private Integer idSeguridad;

    @Column(name = "seccion", nullable = false, length = 50)
    private String seccion;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "fecha_hora", insertable = false, updatable = false)
    private LocalDateTime fechaHora;

    @Column(name = "campos_modificados", columnDefinition = "TEXT")
    private String camposModificados;

    @Column(name = "valores_anteriores", columnDefinition = "jsonb")
    private String valoresAnteriores;

    @Column(name = "valores_nuevos", columnDefinition = "jsonb")
    private String valoresNuevos;
}