package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_oferta", schema = "ofertas")
@Data
public class HistorialOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    // Relación con la tabla oferta_laboral
    // OJO: Asegúrate de tener la entidad OfertaLaboral importada correctamente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_oferta", nullable = false)
    private OfertaLaboral oferta;

    // Relación con la tabla de seguridad (el usuario de la BD)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seguridad")
    private Seguridad seguridad;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "campo_modificado", columnDefinition = "TEXT")
    private String campoModificado;

    // Usamos LocalDateTime porque la tabla guarda fecha y hora (timestamp)
    // insertable = false, updatable = false -> Dejamos que Postgres ponga la fecha por defecto
    @Column(name = "fecha_hora", insertable = false, updatable = false)
    private LocalDateTime fechaHora;

    // Los campos JSONB de Postgres se pueden mapear como String en Java.
    // Si usas Hibernate 6+, podrías usar la anotación @JdbcTypeCode(SqlTypes.JSON) si lo prefieres.
    @Column(name = "valores_anteriores", columnDefinition = "jsonb")
    private String valoresAnteriores;

    @Column(name = "valores_nuevos", columnDefinition = "jsonb")
    private String valoresNuevos;
}