package com.example.demo.repository.Impl;

import com.example.demo.dto.PerfilPostulanteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostulacionCustomRepository {
    private final JdbcTemplate jdbcTemplate;

    public PerfilPostulanteDTO obtenerPerfilCompleto(Long idPostulacion) {
        String sql = "select * from postulaciones.fn_obtener_perfil_postulante(?)";

        List<PerfilPostulanteDTO> resultados = jdbcTemplate.query(sql, (rs, rowNum) -> {
            PerfilPostulanteDTO dto = new PerfilPostulanteDTO();
            dto.setIdUsuario(rs.getLong("id_usuario"));
            dto.setNombre(rs.getString("nombre"));
            dto.setApellido(rs.getString("apellido"));
            dto.setCorreo(rs.getString("correo"));
            dto.setTelefono(rs.getString("telefono"));
            dto.setGenero(rs.getString("genero"));
            dto.setArchivoCv(rs.getString("archivo_cv"));
            dto.setFechaPostulacion(rs.getTimestamp("fecha_postulacion"));
            dto.setUrlFotoPerfil(rs.getString("url_foto_perfil"));
            dto.setFormacionAcademica(rs.getString("formacion_academica"));
            dto.setExperienciaLaboral(rs.getString("experiencia_laboral"));
            dto.setCursosRealizados(rs.getString("cursos_realizados"));
            dto.setIdiomas(rs.getString("idiomas"));

            return dto;
        }, idPostulacion);

        return resultados.isEmpty() ? null : resultados.get(0);
    }
}
