package com.example.demo.repository;

import com.example.demo.model.OfertasFavoritas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertasFavoritasRepository extends JpaRepository<OfertasFavoritas, Integer> {

    // Métodos para Dashboard stats
    @Query(value = "select ofertas.fn_contar_favoritas_usuario(:idUsuario)", nativeQuery = true)
    long countByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "select ofertas.fn_contar_favoritas_usuario_hoy(:idUsuario)", nativeQuery = true)
    long countByUsuarioToday(@Param("idUsuario") Long idUsuario);

    @Query(value = "select * from ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(:idUsuario)", nativeQuery = true)
    List<Object[]> getLast7Days(@Param("idUsuario") Long idUsuario);

    @Query(value = "select * from ofertas.fn_obtener_favoritas_usuario_historico(:idUsuario)", nativeQuery = true)
    List<Object[]> getHistoric12Months(@Param("idUsuario") Long idUsuario);
}