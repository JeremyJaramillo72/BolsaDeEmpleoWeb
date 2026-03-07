package com.example.demo.repository;

import com.example.demo.model.PerfilAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Repository
public interface PerfilAcademicoRepository extends JpaRepository<PerfilAcademico, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL usuarios.sp_registrar_perfil_academico(:idUsuario, :idCarrera, :fechaGrad, :numSenescyt, :urlArchivo)", nativeQuery = true)
    void registrarPerfilCompletoPro(
            @Param("idUsuario") Long idUsuario,
            @Param("idCarrera") Integer idCarrera,
            @Param("fechaGrad") LocalDate fechaGraduacion,
            @Param("numSenescyt") String numeroSenescyt,
            @Param("urlArchivo") String urlArchivo
    );
    @Procedure(procedureName = "usuarios.sp_actualizar_datos_personales")
    void actualizarDatosPersonalesPro(
            @Param("p_id_usuario") Long idUsuario,
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_fecha_nacimiento") LocalDate fechaNacimiento,
            @Param("p_genero") String genero,
            @Param("p_telefono") String telefono,
            @Param("p_id_ciudad") Integer idCiudad
    );

    @Procedure(procedureName = "usuarios.sp_actualizar_formacion_academica")
    void actualizarFormacionAcademica(
            @Param("p_id_academico") Integer idAcademico,
            @Param("p_id_carrera") Integer idCarrera,
            @Param("p_fecha_graduacion") LocalDate fechaGraduacion,
            @Param("p_registro_senescyt") String registroSenescyt,
            @Param("p_archivo") String archivo
    );
}