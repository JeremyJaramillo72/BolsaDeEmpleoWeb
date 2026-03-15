package com.example.demo.repository.Impl;


import com.example.demo.dto.PerfilProfesionalDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PerfilProfesionalRepository {

    private final JdbcTemplate jdbcTemplate;
    public PerfilProfesionalDTO obtenerPerfilCompleto(Long idUsuario) {
        String sql = "select * from usuarios.fn_obtener_perfil_profesional(?)";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            PerfilProfesionalDTO dto = new PerfilProfesionalDTO();
            dto.setIdUsuario(rs.getLong("id_usuario"));
            dto.setNombre(rs.getString("nombre"));
            dto.setApellido(rs.getString("apellido"));
            dto.setCorreo(rs.getString("correo"));
            dto.setTelefono(rs.getString("telefono"));
            dto.setGenero(rs.getString("genero"));

            if (rs.getDate("fecha_nacimiento") != null) {
                dto.setFechaNacimiento(rs.getDate("fecha_nacimiento").toLocalDate());
            }
            dto.setIdCiudad(rs.getInt("id_ciudad"));
            dto.setIdProvincia(rs.getInt("id_provincia"));
            dto.setUrlFotoPerfil(rs.getString("url_foto_perfil"));
            dto.setFormacionAcademica(rs.getString("formacion_academica"));
            dto.setExperienciaLaboral(rs.getString("experiencia_laboral"));
            dto.setCursosRealizados(rs.getString("cursos_realizados"));
            dto.setIdiomas(rs.getString("idiomas"));

            return dto;
        }, idUsuario);
    }


    public void registrarItemPerfil(Long idUsuario, String tipoItem, String jsonDatos, String urlArchivo) {

        String sql = "select usuarios.fn_registrar_item_perfil(?, ?, ?::jsonb, ?)";


        jdbcTemplate.query(sql, rs -> {}, idUsuario, tipoItem, jsonDatos, urlArchivo);
    }
    public void eliminarItemPerfil(Long idUsuario, String tipoItem, Integer idItem) {

        String sql = "select usuarios.fn_eliminar_item_perfil(?, ?, ?)";

        jdbcTemplate.query(sql, rs -> {}, idUsuario, tipoItem, idItem);
    }

    public Integer crearCargo(String nombreCargo) {
        String sql = "select catalogos.fn_crear_cargo(?)";
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> rs.getInt(1), nombreCargo);
    }

    public Integer crearEmpresa(String nombreEmpresa, String ruc, Integer idCategoria) {
        String sql = "select empresas.fn_crear_empresa(?, ?, ?)";
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> rs.getInt(1), nombreEmpresa, ruc, idCategoria);
    }

    public String obtenerUrlFoto(Long idUsuario) {
        return jdbcTemplate.queryForObject("SELECT usuarios.fn_obtener_url_imagen(?)", String.class, idUsuario);
    }

}
