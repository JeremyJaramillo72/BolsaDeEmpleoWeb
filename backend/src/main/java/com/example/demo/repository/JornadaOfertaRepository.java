package com.example.demo.repository;

import com.example.demo.model.JornadaOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface JornadaOfertaRepository extends JpaRepository<JornadaOferta, Integer> {

    // Método para hacer el UPDATE directo en la base de datos
    @Modifying
    @Transactional
    @Query("UPDATE JornadaOferta j SET j.nombreJornada = :nombre WHERE j.idJornada = :id")
    int actualizarNombreJornada(@Param("id") Integer id, @Param("nombre") String nombre);
}