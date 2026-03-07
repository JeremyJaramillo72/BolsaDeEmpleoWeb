package com.example.demo.repository;

import com.example.demo.model.OfertasFavoritas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OfertasFavoritasRepository extends JpaRepository<OfertasFavoritas, Integer> {

    // Métodos para Dashboard stats
    @Query("SELECT COUNT(of) FROM OfertasFavoritas of WHERE of.usuario.idUsuario = :idUsuario AND of.estadoFav = 'Activo'")
    long countByUsuario(@Param("idUsuario") Long idUsuario);
}