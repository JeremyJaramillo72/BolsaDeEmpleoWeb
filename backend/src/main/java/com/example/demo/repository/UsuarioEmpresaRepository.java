package com.example.demo.repository;

import com.example.demo.model.UsuarioEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioEmpresaRepository extends JpaRepository<UsuarioEmpresa, Long> {


     @Procedure(procedureName = "sp_PerfilEmpresa")
     void actualizarDatosEmpresa(
             Long p_IdEmpresa,
             String p_nombreEmpresa,
             String p_sitioWeb,
             String p_descripcion
     );

    boolean existsByRuc(String ruc);
        Optional <UsuarioEmpresa> findByUsuario_IdUsuario(long idUsuario);

    @Query(value = "SELECT * FROM usuario_empresa WHERE id_usuario = :idUsuario", nativeQuery = true)
    UsuarioEmpresa findByIdUsuario(@Param("idUsuario") Long idUsuario);
}