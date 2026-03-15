package com.example.demo.repository;

import com.example.demo.model.ModalidadOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ModalidadOfertaRepository extends JpaRepository<ModalidadOferta, Integer> {

    // Método para hacer el UPDATE directo en la base de datos
    @Modifying
    @Transactional
    @Query("UPDATE ModalidadOferta m SET m.nombreModalidad = :nombre WHERE m.idModalidad = :id")
    int actualizarNombreModalidad(@Param("id") Integer id, @Param("nombre") String nombre);
}