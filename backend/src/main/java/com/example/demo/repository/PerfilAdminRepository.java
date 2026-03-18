package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Usuario;

import java.util.List;

@Repository
public interface PerfilAdminRepository extends JpaRepository<Usuario, Long> {

    // ── Obtener perfil completo con URL de imagen ─────────────────────────
    @Query(value = "SELECT * FROM usuarios.fn_obtener_perfil_usuario(:idUsuario)",
            nativeQuery = true)
    List<Object[]> obtenerPerfil(@Param("idUsuario") Long idUsuario);

    // ── Actualizar datos generales via SP JSONB ───────────────────────────
    @Modifying
    @Transactional
    @Query(value = "CALL usuarios.sp_actualizar_perfil_usuario(:idUsuario, CAST(:datos AS jsonb))",
            nativeQuery = true)
    void actualizarPerfil(@Param("idUsuario") Long idUsuario,
                          @Param("datos")     String datosJson);
}