package com.example.demo.repository;

import com.example.demo.dto.ReporteUsuarioDTO;
import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReporteUsuarioRepository
        extends JpaRepository<Usuario, Long> {

    @Query(value = """
        SELECT 
            u.nombre AS nombre,
            u.apellido AS apellido,
            u.correo AS correo,
            COALESCE(STRING_AGG(DISTINCT cu.nombre_curso, ', '), '') AS cursos,
            COALESCE(STRING_AGG(DISTINCT i.nombre_idioma, ', '), '') AS idiomas
        FROM usuario u
        LEFT JOIN cursos cu 
            ON cu.id_usuario = u.id_usuario
        LEFT JOIN usuario_idioma ui 
            ON ui.id_usuario = u.id_usuario
        LEFT JOIN idioma i 
            ON i.id_idioma = ui.id_idioma
        WHERE (:correo IS NULL OR u.correo ILIKE CONCAT('%', :correo, '%'))
        GROUP BY u.id_usuario, u.nombre, u.apellido, u.correo
        ORDER BY u.apellido
        """, nativeQuery = true)
    List<ReporteUsuarioDTO> obtenerReporteUsuarios(
            @Param("correo") String correo
    );
}
