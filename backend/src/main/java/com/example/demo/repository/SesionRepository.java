package com.example.demo.repository;

import com.example.demo.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    // 1. 🔥 CORREGIDO: Usamos el guion bajo para entrar a la propiedad del objeto
    List<Sesion> findBySeguridad_IdSeguridad(Integer idSeguridad);

    // 2. 🔥 PERFECTO: Este lo arreglaste como un crack
    Optional<Sesion> findTopBySeguridad_IdSeguridadOrderByFechaInicioDesc(Integer idSeguridad);

    // 3. Este está perfecto porque "accion" sigue siendo un String directo en Sesion
    List<Sesion> findByAccion(String accion);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE seguridad.sesiones
            SET accion = 'CERRADA', fecha_cierre = NOW()
            WHERE id_seguridad = :idSeguridad AND accion = 'ACTIVA'
            """, nativeQuery = true)
    int cerrarSesionesActivasPorSeguridad(@Param("idSeguridad") Integer idSeguridad);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE seguridad.sesiones
            SET accion = 'CERRADA', fecha_cierre = NOW()
            WHERE accion = 'ACTIVA'
              AND id_sesion NOT IN (
                SELECT MAX(s2.id_sesion)
                FROM seguridad.sesiones s2
                WHERE s2.accion = 'ACTIVA'
                GROUP BY s2.id_seguridad
              )
            """, nativeQuery = true)
    int cerrarSesionesActivasDuplicadas();
}