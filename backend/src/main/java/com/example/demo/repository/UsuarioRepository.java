package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.sql.Date;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    // Sincronizado con sp_registrar_postulante
    @Procedure(procedureName = "usuarios.sp_registrar_postulante")
    void registrarPostulantePro(
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_contrasena") String contra,
            @Param("p_correo") String correo,
            @Param("p_fecha_nacimiento") Date fecha, // Ajustado snake_case
            @Param("p_genero") String genero,
            @Param("p_telefono") String telf,
            @Param("p_id_ciudad") Integer idCiudad,   // Ajustado snake_case
            @Param("p_id_rol") Integer idRol         // Ajustado snake_case
    );

    // Sincronizado con sp_registrar_empresa_completa (7 parámetros)
    @Procedure(procedureName = "empresas.sp_registrar_empresa_completa")
    void registrarEmpresaPro(
            @Param("p_correo") String correo,
            @Param("p_contrasena") String contra,
            @Param("p_id_ciudad") Integer idCiudad,   // Ajustado snake_case
            @Param("p_nombre") String nombreEmp, // Ajustado snake_case
            @Param("p_descripcion") String desc,
            @Param("p_ruc") String ruc,
            @Param("p_sitioweb") String web
    );

    @Procedure(procedureName = "seguridad.sp_registrar_admin_interno")
    void registrarAdminInternoPro(
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_contrasena") String contra,
            @Param("p_correo") String correo,
            @Param("p_fecha_nacimiento") Date fecha,
            @Param("p_genero") String genero,
            @Param("p_telefono") String telf,
            @Param("p_id_ciudad") Integer idCiudad,
            @Param("p_id_rol") Integer idRol,
            @Param("p_permisos_ui") String permisosUi // <--- ¡EL NUEVO PARAMETRO!
    );
    @Modifying
    @Transactional
    @Query(value = "CALL seguridad.registrousuariologin(:correo, :idUsuario, :idRol)", nativeQuery = true)
    void crearCredencialesBD(
            @Param("correo") String correo,
            @Param("idUsuario") Integer idUsuario,
            @Param("idRol") Integer idRol
    );

    @Procedure(procedureName = "sp_registrar_admin")
    void registrarAdminPro(
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_contrasena") String contra,
            @Param("p_correo") String correo,
            @Param("p_telefono") String telf,
            @Param("p_id_ciudad") Integer idCiudad // Ponlo como Integer aquí
    );
    List<Usuario> findByRol_IdRolNotIn(List<Integer> idsNoDeseados);
}