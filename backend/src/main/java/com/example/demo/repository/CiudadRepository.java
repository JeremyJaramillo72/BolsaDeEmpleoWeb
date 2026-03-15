package com.example.demo.repository;

import com.example.demo.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {

    List<Ciudad> findByProvincia_IdProvincia(Integer idProvincia);

    // Método optimizado para actualizar directo en BD
    @Modifying
    @Transactional
    @Query("UPDATE Ciudad c SET c.nombreCiudad = :nombre, c.provincia.idProvincia = :idProvincia WHERE c.idCiudad = :id")
    int actualizarCiudadDirecto(@Param("id") Integer id, @Param("nombre") String nombre, @Param("idProvincia") Integer idProvincia);
}