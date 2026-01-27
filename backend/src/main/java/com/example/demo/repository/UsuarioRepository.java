package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.sql.Date;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    // Sincronizado con sp_registrar_postulante
    @Procedure(procedureName = "sp_registrar_postulante")
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
    @Procedure(procedureName = "sp_registrar_empresa_completa")
    void registrarEmpresaPro(
            @Param("p_correo") String correo,
            @Param("p_contrasena") String contra,
            @Param("p_id_ciudad") Integer idCiudad,   // Ajustado snake_case
            @Param("p_nombre_empresa") String nombreEmp, // Ajustado snake_case
            @Param("p_descripcion") String desc,
            @Param("p_ruc") String ruc,
            @Param("p_sitioweb") String web
    );
}