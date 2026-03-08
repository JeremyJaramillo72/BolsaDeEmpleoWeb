package com.example.demo.repository.Impl;

import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPerfilBaseDTO;
import com.example.demo.dto.ResumenSeccionDTO;
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
            dto.setEstadoPostulacion(rs.getString("estado_postulacion"));
            dto.setMensajeEvaluacion(rs.getString("mensaje_evaluacion"));
            try { dto.setNombreEmpresa(rs.getString("nombre_empresa")); } catch (Exception ignored) {}
            return dto;
        }, idPostulacion);

        return resultados.isEmpty() ? null : resultados.get(0);
    }

    public List<PostulanteResumenDTO> obtenerPostulantesPorOferta(Long idOferta) {
        String sql = "select * from postulaciones.fn_obtener_postulantes_por_oferta(?)";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PostulanteResumenDTO dto = new PostulanteResumenDTO();
            dto.setIdPostulacion(rs.getLong("id_postulacion"));
            dto.setNombreCompleto(rs.getString("nombre_completo"));
            dto.setProfesion(rs.getString("profesion"));
            dto.setFechaPostulacion(rs.getTimestamp("fecha_postulacion"));
            dto.setEstado(rs.getString("estado"));


            return dto;
        }, idOferta);
    }

    public void evaluarItemIndividual(Long idPostulacion, String tipoItem, Integer idItem, String estado, String observacion) {

        String sql = "select postulaciones.fn_validar_item_individual(?, ?, ?, ?, ?)";
        jdbcTemplate.queryForList(sql, idPostulacion, tipoItem, idItem, estado, observacion);
    }

    public void evaluarPostulacionGeneral(Long idPostulacion, String estado, String mensaje) {
        String sql = "select postulaciones.fn_evaluar_postulacion_general(?::bigint, ?::varchar, ?::text)";
        jdbcTemplate.queryForList(sql, idPostulacion, estado, mensaje);
    }

    // ── Métodos por sección ──────────────────────────────────────────────

    public ResumenPerfilBaseDTO obtenerPerfilBase(Long idPostulacion) {
        String sql = "select * from postulaciones.fn_resumen_perfil_base(?)";
        List<ResumenPerfilBaseDTO> res = jdbcTemplate.query(sql, (rs, rowNum) -> {
            ResumenPerfilBaseDTO dto = new ResumenPerfilBaseDTO();
            dto.setNombre(rs.getString("p_nombre"));
            dto.setApellido(rs.getString("p_apellido"));
            dto.setCorreo(rs.getString("p_correo"));
            dto.setUrlFotoPerfil(rs.getString("p_url_foto_perfil"));
            dto.setArchivoCv(rs.getString("p_archivo_cv"));
            dto.setFechaPostulacion(rs.getTimestamp("p_fecha_postulacion"));
            dto.setEstadoPostulacion(rs.getString("p_estado_postulacion"));
            dto.setMensajeEvaluacion(rs.getString("p_mensaje_evaluacion"));
            dto.setNombreEmpresa(rs.getString("p_nombre_empresa"));
            return dto;
        }, idPostulacion);
        return res.isEmpty() ? null : res.get(0);
    }

    public List<ResumenSeccionDTO> obtenerFormacion(Long idPostulacion) {
        return jdbcTemplate.query(
            "select * from postulaciones.fn_resumen_formacion(?)",
            (rs, rowNum) -> mapSeccion(rs), idPostulacion);
    }

    public List<ResumenSeccionDTO> obtenerExperiencia(Long idPostulacion) {
        return jdbcTemplate.query(
            "select * from postulaciones.fn_resumen_experiencia(?)",
            (rs, rowNum) -> mapSeccion(rs), idPostulacion);
    }

    public List<ResumenSeccionDTO> obtenerCursos(Long idPostulacion) {
        return jdbcTemplate.query(
            "select * from postulaciones.fn_resumen_cursos(?)",
            (rs, rowNum) -> mapSeccion(rs), idPostulacion);
    }

    public List<ResumenSeccionDTO> obtenerIdiomas(Long idPostulacion) {
        return jdbcTemplate.query(
            "select * from postulaciones.fn_resumen_idiomas(?)",
            (rs, rowNum) -> mapSeccion(rs), idPostulacion);
    }

    private ResumenSeccionDTO mapSeccion(java.sql.ResultSet rs) throws java.sql.SQLException {
        ResumenSeccionDTO dto = new ResumenSeccionDTO();
        dto.setNombre(rs.getString("p_nombre"));
        dto.setArchivo(rs.getString("p_archivo"));
        dto.setEstadoV(rs.getString("p_estado_v"));
        dto.setObservacionV(rs.getString("p_observacion_v"));
        return dto;
    }
}
