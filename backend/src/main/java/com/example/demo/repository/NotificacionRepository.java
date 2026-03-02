package com.example.demo.repository;

import com.example.demo.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    // Obtener notificaciones del usuario ordenadas por fecha
    @Query("SELECT n FROM Notificacion n WHERE n.usuario.idUsuario = :idUsuario ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findByUsuarioId(@Param("idUsuario") Long idUsuario);

    long countByUsuario_IdUsuarioAndLeidaFalse(Long idUsuario);

    boolean existsByUsuario_IdUsuarioAndTipoAndLeidaFalse(Long idUsuario, String tipo);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.idUsuario = :idUsuario AND n.leida = false")
    void marcarTodasComoLeidas(@Param("idUsuario") Long idUsuario);
}