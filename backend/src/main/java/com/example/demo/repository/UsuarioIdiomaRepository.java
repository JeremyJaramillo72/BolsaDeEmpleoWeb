package com.example.demo.repository;

import com.example.demo.model.UsuarioIdioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioIdiomaRepository extends JpaRepository<UsuarioIdioma, Integer> {

    @Modifying
    @Query(value = "CALL sp_registrar_idioma_usuario(:idU, :idI, :niv, :arc, :cod)", nativeQuery = true)
    void registrarIdiomaPro(
            @Param("idU") Long idUsuario,
            @Param("idI") Integer idIdioma,
            @Param("niv") String nivel,
            @Param("arc") byte[] archivo,
            @Param("cod") String codigo
    );
}