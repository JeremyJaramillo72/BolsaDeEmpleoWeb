package com.example.demo.repository;

import com.example.demo.model.PerfilAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Repository
public interface PerfilAcademicoRepository extends JpaRepository<PerfilAcademico, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL sp_registrar_perfil_academico(:idUsuario, :idCarrera, :fechaGrad, :numSenescyt, :archivo)", nativeQuery = true)
    void registrarPerfilCompletoPro(
            @Param("idUsuario") Long idUsuario,
            @Param("idCarrera") Integer idCarrera,
            @Param("fechaGrad") LocalDate fechaGraduacion,
            @Param("numSenescyt") String numeroSenescyt,
            @Param("archivo") byte[] archivo
    );
}