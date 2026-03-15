package com.example.demo.repository;

import com.example.demo.model.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CarreraRepository extends JpaRepository<Carrera, Integer> {

    List<Carrera> findByFacultadIdFacultad(Integer idFacultad);

    // Método para hacer el UPDATE directo en la base de datos
    @Modifying
    @Transactional
    @Query("UPDATE Carrera c SET c.nombreCarrera = :nombre, c.facultad.idFacultad = :idFacultad WHERE c.idCarrera = :id")
    int actualizarCarreraDirecto(@Param("id") Integer id, @Param("nombre") String nombre, @Param("idFacultad") Integer idFacultad);
}