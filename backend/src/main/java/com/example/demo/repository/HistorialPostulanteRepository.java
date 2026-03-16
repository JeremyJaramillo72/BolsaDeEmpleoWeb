package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
// Reemplaza "HistorialPostulante" con la entidad base que uses para esta tabla
import com.example.demo.model.HistorialPostulante;

@Repository
public interface HistorialPostulanteRepository extends JpaRepository<HistorialPostulante, Long> {

    @Query(value = "SELECT * FROM usuarios.fn_obtener_postulantes_auditoria(CAST(:json AS json))", nativeQuery = true)
    List<Object[]> obtenerPostulantesAuditoriaObj(@Param("json") String json);

    @Query(value = "SELECT * FROM usuarios.fn_obtener_trazabilidad_postulante(CAST(:json AS json))", nativeQuery = true)
    List<Object[]> obtenerTrazabilidadPorPerfilObj(@Param("json") String json);
}