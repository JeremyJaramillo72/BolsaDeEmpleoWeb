package com.example.demo.repository;

import com.example.demo.model.Idioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface IdiomaRepository extends JpaRepository<Idioma, Integer> {

    // Método para hacer el UPDATE directo en la base de datos
    @Modifying
    @Transactional
    @Query("UPDATE Idioma i SET i.nombreIdioma = :nombre WHERE i.idIdioma = :id")
    int actualizarNombreIdioma(@Param("id") Integer id, @Param("nombre") String nombre);
}