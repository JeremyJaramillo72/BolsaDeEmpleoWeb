package com.example.demo.repository;

import com.example.demo.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    // Obtener notificaciones del usuario ordenadas por fecha
    @Query(value = "SELECT * FROM usuarios.fn_obtener_notificaciones_usuario(:idUsuario)", nativeQuery = true)
    List<Notificacion> findByUsuarioId(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT usuarios.fn_contar_no_leidas(:idUsuario)", nativeQuery = true)
    long countByUsuario_IdUsuarioAndLeidaFalse(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT usuarios.fn_existe_notificacion_tipo(:idUsuario, :tipo)", nativeQuery = true)
    boolean existsByUsuario_IdUsuarioAndTipoAndLeidaFalse(@Param("idUsuario") Long idUsuario, @Param("tipo") String tipo);

    @Modifying
    @Query(value = "CALL usuarios.sp_marcar_todas_leidas(:idUsuario)", nativeQuery = true)
    void marcarTodasComoLeidas(@Param("idUsuario") Long idUsuario);
}