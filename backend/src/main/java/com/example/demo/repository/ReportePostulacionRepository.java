package com.example.demo.repository;

import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.model.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@org.springframework.stereotype.Repository
public interface ReportePostulacionRepository
        extends JpaRepository<Postulacion, Long> {

    @Query(value = """
        SELECT 
            o.titulo AS titulo,
            u.nombre AS nombre,
            u.apellido AS apellido,
            p.fecha_postulacion AS fechaPostulacion,
            p.estado_validacion AS estadoValidacion
        FROM postulacion p
        INNER JOIN oferta_laboral o 
            ON o.id_oferta = p.id_oferta
        INNER JOIN usuario u 
            ON u.id_usuario = p.id_usuario
        WHERE (:estadoValidacion IS NULL 
               OR :estadoValidacion = '' 
               OR p.estado_validacion = :estadoValidacion)
        ORDER BY p.fecha_postulacion DESC
        """, nativeQuery = true)
    List<ReportePostulacionDTO> obtenerReportePostulaciones(
            @Param("estadoValidacion") String estadoValidacion
    );
}
