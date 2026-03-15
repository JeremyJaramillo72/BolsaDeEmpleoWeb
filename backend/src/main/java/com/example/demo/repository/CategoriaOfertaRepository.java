package com.example.demo.repository;

import com.example.demo.model.CategoriaOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CategoriaOfertaRepository extends JpaRepository<CategoriaOferta, Integer> {

    @Modifying
    @Transactional
    @Query("UPDATE CategoriaOferta c SET c.nombreCategoria = :nombre WHERE c.idCategoria = :id")
    int actualizarNombreCategoria(@Param("id") Integer id, @Param("nombre") String nombre);

}