package com.example.demo.repository;

import com.example.demo.model.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportePostulacionRepository extends JpaRepository<Postulacion, Long> {
    @Query(value = "SELECT * FROM postulaciones.fn_reporte_postulaciones_dinamico02(:idOferta, :idCarrera, :estado, :desde, :hasta, :limit, :offset)",
            nativeQuery = true)
    List<Object[]> ejecutarReporte(
            @Param("idOferta") Long idOferta,
            @Param("idCarrera") Integer idCarrera,
            @Param("estado") String estado,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta,
            @Param("limit") Integer limit,
            @Param("offset") Integer offset
    );
}