package com.example.demo.repository;

import com.example.demo.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    @Query(value = "SELECT * FROM usuarios.fn_obtener_notificaciones_usuario(:idUsuario)", nativeQuery = true)
    List<Notificacion> findByUsuarioId(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT usuarios.fn_contar_no_leidas(:idUsuario)", nativeQuery = true)
    long countByUsuario_IdUsuarioAndLeidaFalse(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT usuarios.fn_existe_notificacion_tipo(:idUsuario, :tipo)", nativeQuery = true)
    boolean existsByUsuario_IdUsuarioAndTipoAndLeidaFalse(@Param("idUsuario") Long idUsuario, @Param("tipo") String tipo);

    @Modifying
    @Query(value = "CALL usuarios.sp_marcar_todas_leidas(:idUsuario)", nativeQuery = true)
    void marcarTodasComoLeidas(@Param("idUsuario") Long idUsuario);

    // Métodos para Dashboard stats
    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.usuario.idUsuario = :idUsuario")
    long countByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT COUNT(*) FROM usuarios.notificacion WHERE id_usuario = :idUsuario AND DATE(fecha_creacion) = CURRENT_DATE", nativeQuery = true)
    long countByUsuarioToday(@Param("idUsuario") Long idUsuario);

    // Métodos para datos de últimos 7 días
    @Query(value = "SELECT CAST(n.fecha_creacion AS DATE) as fecha, COUNT(*) as count FROM usuarios.notificacion n WHERE n.id_usuario = :idUsuario AND n.fecha_creacion >= CURRENT_DATE - INTERVAL '7 days' GROUP BY CAST(n.fecha_creacion AS DATE) ORDER BY fecha ASC", nativeQuery = true)
    List<Object[]> getLast7DaysByUsuario(@Param("idUsuario") Long idUsuario);

    // Métodos para datos históricos (12 meses)
    @Query(value = "SELECT TO_CHAR(n.fecha_creacion, 'YYYY-MM') AS yearMonth, COUNT(*) as count FROM usuarios.notificacion n WHERE n.id_usuario = :idUsuario AND n.fecha_creacion >= '2026-01-01'::date GROUP BY TO_CHAR(n.fecha_creacion, 'YYYY-MM') ORDER BY yearMonth ASC", nativeQuery = true)
    List<Object[]> getHistoric12MonthsByUsuario(@Param("idUsuario") Long idUsuario);

    // Métodos para contar notificaciones no leídas (unread)
    @Query(value = "select usuarios.fn_contar_notificaciones_no_leidas(:idUsuario)", nativeQuery = true)
    long countUnreadByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "select usuarios.fn_contar_notificaciones_no_leidas_hoy(:idUsuario)", nativeQuery = true)
    long countUnreadByUsuarioToday(@Param("idUsuario") Long idUsuario);

    // Métodos para últimos 7 días (notificaciones no leídas)
    @Query(value = "select * from usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(:idUsuario)", nativeQuery = true)
    List<Object[]> getLast7DaysUnreadByUsuario(@Param("idUsuario") Long idUsuario);

    // Métodos para datos históricos (12 meses) - notificaciones no leídas
    @Query(value = "select * from usuarios.fn_obtener_notificaciones_no_leidas_historico(:idUsuario)", nativeQuery = true)
    List<Object[]> getHistoric12MonthsUnreadByUsuario(@Param("idUsuario") Long idUsuario);

    // Métodos para empresa - contar notificaciones de usuarios de una empresa
    @Query(value = "select usuarios.fn_contar_notificaciones_empresa(:idEmpresa)", nativeQuery = true)
    long countByEmpresa(@Param("idEmpresa") Long idEmpresa);

    @Query(value = "select usuarios.fn_contar_notificaciones_empresa_hoy(:idEmpresa)", nativeQuery = true)
    long countByEmpresaToday(@Param("idEmpresa") Long idEmpresa);

    @Query(value = "select * from usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(:idEmpresa)", nativeQuery = true)
    List<Object[]> getLast7DaysByEmpresa(@Param("idEmpresa") Long idEmpresa);

    @Query(value = "select * from usuarios.fn_obtener_notificaciones_empresa_historico(:idEmpresa)", nativeQuery = true)
    List<Object[]> getHistoric12MonthsByEmpresa(@Param("idEmpresa") Long idEmpresa);
}
