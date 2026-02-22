package com.example.demo.repository;

import com.example.demo.model.exp_laboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpLaboralRepository extends JpaRepository<exp_laboral, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL usuarios.sp_registrar_exp_laboral(:idUsuario, :idCargo, :idEmpresa, :fechaInicio, :fechaFin, :descripcion, :ubicacion, :urlComprobante)", nativeQuery = true)
    void registrarExpLaboralPro(
            @Param("idUsuario") Long idUsuario,
            @Param("idCargo") Integer idCargo,
            @Param("idEmpresa") Integer idEmpresaCatalogo,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("descripcion") String descripcion,
            @Param("ubicacion") String ubicacion,
            @Param("urlComprobante") String urlComprobante
    );

    // Método para obtener todas las experiencias laborales de un usuario
    List<exp_laboral> findByUsuario_IdUsuario(Long idUsuario);
}