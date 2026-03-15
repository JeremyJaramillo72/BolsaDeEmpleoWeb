package com.example.demo.repository;

import com.example.demo.model.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {

    // Llamada a la función PostgreSQL pasando el String que casteamos a JSON
    @Query(value = "SELECT usuarios.fn_enlazar_permisos_rol(CAST(:jsonData AS JSON))", nativeQuery = true)
    String enlazarPermisosRolBd(@Param("jsonData") String jsonData);

    // ✅ NUEVO: buscar rol por su idRolBd para recuperar permisos enlazados
    Optional<Roles> findByIdRolBd(String idRolBd);

    // ==========================================
    //      MÉTODO AÑADIDO PARA ACTUALIZAR
    // ==========================================
    @Modifying
    @Transactional
    @Query("UPDATE Roles r SET r.nombreRol = :nombre WHERE r.idRol = :id")
    int actualizarNombreRol(@Param("id") Integer id, @Param("nombre") String nombre);
}