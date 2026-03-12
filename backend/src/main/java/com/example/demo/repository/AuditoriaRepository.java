package com.example.demo.repository;

import com.example.demo.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {

    // Métodos para Dashboard stats - Contar auditorías
    @Query(value = "select seguridad.fn_contar_auditorias_total()", nativeQuery = true)
    long countAll();

    @Query(value = "select seguridad.fn_contar_auditorias_hoy()", nativeQuery = true)
    long countToday();

    // Métodos para últimos 7 días
    @Query(value = "select * from seguridad.fn_obtener_auditorias_ultimos_7_dias()", nativeQuery = true)
    List<Object[]> getLast7Days();

    // Métodos para datos históricos (desde enero 2026)
    @Query(value = "select * from seguridad.fn_obtener_auditorias_historico()", nativeQuery = true)
    List<Object[]> getHistoric12Months();

    // Método para obtener auditorías de top 4-5 usuarios con datos mensuales (para gráfico multi-línea)
    @Query(value = "select * from seguridad.fn_obtener_auditorias_top_usuarios_historico()", nativeQuery = true)
    List<Object[]> getTopUsersAuditHistoric();

    // Método para obtener historial de un registro específico (ej: configuración de correo)
    List<Auditoria> findByTablaAfectadaAndIdRegistroAfectadoOrderByFechaHoraDesc(String tablaAfectada, Integer idRegistroAfectado);
}