package com.example.demo.repository;

import com.example.demo.model.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ProvinciaRepository extends JpaRepository<Provincia, Integer> {

    // Método optimizado para actualizar directo en BD
    @Modifying
    @Transactional
    @Query("UPDATE Provincia p SET p.nombreProvincia = :nombre WHERE p.idProvincia = :id")
    int actualizarNombreProvincia(@Param("id") Integer id, @Param("nombre") String nombre);
}