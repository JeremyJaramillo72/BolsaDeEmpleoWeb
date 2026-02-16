package com.example.demo.repository;

import com.example.demo.model.UsuarioImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UsuarioImagenRepository extends JpaRepository<UsuarioImagen, Integer> {
    @Modifying
    @Transactional
    @Query(value = "call usuarios.sp_guardar_url_imagen(?1, ?2)", nativeQuery = true)
    void guardarUrlImagen(Integer idUsuario, String url);
}