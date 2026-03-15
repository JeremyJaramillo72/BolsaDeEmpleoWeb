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

    @Procedure(procedureName = "usuarios.sp_registrar_postulante")
    void registrarPostulantePro(
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_contrasena") String contra,
            @Param("p_correo") String correo,
            @Param("p_fecha_nacimiento") Date fecha,
            @Param("p_genero") String genero,
            @Param("p_telefono") String telf,
            @Param("p_id_ciudad") Integer idCiudad,
            @Param("p_id_rol") Integer idRol
    );

    @Procedure(procedureName = "empresas.sp_registrar_empresa_completa")
    void registrarEmpresaPro(
            @Param("p_correo") String correo,
            @Param("p_contrasena") String contra,
            @Param("p_id_ciudad") Integer idCiudad,
            @Param("p_nombre") String nombreEmp,
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
            @Param("p_id_rol") Integer idRol
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
            @Param("p_id_ciudad") Integer idCiudad
    );

    List<Usuario> findByRol_IdRolNotIn(List<Integer> idsNoDeseados);

    List<Usuario> findByRol_NombreRol(String nombreRol);

    @Query(value = "SELECT u.id_usuario, u.nombre, u.apellido FROM usuarios.usuario u JOIN catalogos.ciudad c ON u.id_ciudad = c.id_ciudad JOIN usuarios.roles r ON u.id_rol = r.id_rol WHERE c.id_provincia = :idProvincia AND UPPER(r.nombre_rol) = 'POSTULANTE'", nativeQuery = true)
    List<Object[]> findPostulantesByProvinciaNativo(@Param("idProvincia") Integer idProvincia);

    // Métodos para Dashboard stats
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol.nombreRol = :rolName")
    long countByRolName(@Param("rolName") String rolName);

    @Query(value = "SELECT COUNT(*) FROM usuarios.usuario u JOIN usuarios.roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = :rolName AND DATE(u.fecha_registro) = CURRENT_DATE", nativeQuery = true)
    long countByRolNameToday(@Param("rolName") String rolName);

    @Query("SELECT COUNT(u) FROM Usuario u")
    long countAllUsuarios();

    @Query(value = "select usuarios.fn_contar_usuarios_hoy()", nativeQuery = true)
    long countAllUsuariosToday();

    // Métodos para datos de últimos 7 días
    @Query(value = "SELECT CAST(u.fecha_registro AS DATE) as fecha, COUNT(*) as count FROM usuarios.usuario u JOIN usuarios.roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = :rolName AND u.fecha_registro >= CURRENT_DATE - INTERVAL '7 days' GROUP BY CAST(u.fecha_registro AS DATE) ORDER BY fecha ASC", nativeQuery = true)
    List<Object[]> getLast7DaysByRol(@Param("rolName") String rolName);

    @Query(value = "select * from usuarios.fn_obtener_usuarios_ultimos_7_dias()", nativeQuery = true)
    List<Object[]> getLast7DaysAllUsers();

    // Métodos para datos históricos (12 meses)
    @Query(value = "SELECT TO_CHAR(u.fecha_registro, 'YYYY-MM') AS yearMonth, COUNT(*) as count FROM usuarios.usuario u JOIN usuarios.roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = :rolName AND u.fecha_registro >= '2026-01-01'::date GROUP BY TO_CHAR(u.fecha_registro, 'YYYY-MM') ORDER BY yearMonth ASC", nativeQuery = true)
    List<Object[]> getHistoric12MonthsByRol(@Param("rolName") String rolName);

    @Query(value = "select * from usuarios.fn_obtener_usuarios_historico()", nativeQuery = true)
    List<Object[]> getHistoric12MonthsAllUsers();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.estadoValidacion = :estado")
    long countByEstadoValidacion(@Param("estado") String estado);
}
