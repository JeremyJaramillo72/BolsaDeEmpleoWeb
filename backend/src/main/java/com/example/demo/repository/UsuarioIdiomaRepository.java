package com.example.demo.repository;

import com.example.demo.model.UsuarioIdioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioIdiomaRepository extends JpaRepository<UsuarioIdioma, Integer> {

    @Modifying
    @Query(value = "CALL sp_registrar_idioma_usuario(:idU, :idI, :niv, :url, :cod)", nativeQuery = true)
    void registrarIdiomaPro(
            @Param("idU") Long idUsuario,
            @Param("idI") Integer idIdioma,
            @Param("niv") String nivel,
            @Param("url") String urlArchivo,
            @Param("cod") String codigo
    );


    List<UsuarioIdioma> findByUsuario_IdUsuario(Long idUsuario);
    @Procedure(procedureName = "usuarios.sp_actualizar_idioma")
    void actualizarIdioma(
            @Param("p_id_usuario_idioma") Integer idUsuarioIdioma,
            @Param("p_id_idioma") Integer idIdioma,
            @Param("p_nivel") String nivel,
            @Param("p_archivo") String archivo
    );
}