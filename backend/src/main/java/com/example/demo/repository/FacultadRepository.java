package com.example.demo.repository;

import com.example.demo.model.Facultad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FacultadRepository extends JpaRepository<Facultad, Integer> {

    // Método para hacer el UPDATE directo en la base de datos
    @Modifying
    @Transactional
    @Query("UPDATE Facultad f SET f.nombreFacultad = :nombre WHERE f.idFacultad = :id")
    int actualizarNombreFacultad(@Param("id") Integer id, @Param("nombre") String nombre);
}