package com.example.demo.repository;

import com.example.demo.dto.FiltroReportePostulacionDTO;
import com.example.demo.dto.ReportePostulacionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReportePostulacionRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final class ReportePostulacionRowMapper
            implements RowMapper<ReportePostulacionDTO> {

        @Override
        public ReportePostulacionDTO mapRow(ResultSet rs, int rowNum)
                throws SQLException {

            ReportePostulacionDTO dto = new ReportePostulacionDTO();

            dto.setIdPostulacion(   rs.getLong("id_postulacion"));
            dto.setTituloOferta(    rs.getString("titulo_oferta"));
            dto.setNombreEmpresa(   rs.getString("nombre_empresa"));
            dto.setNombreModalidad( rs.getString("nombre_modalidad"));
            dto.setNombreCategoria( rs.getString("nombre_categoria"));
            dto.setNombreCiudad(    rs.getString("nombre_ciudad"));
            dto.setNombrePostulante(rs.getString("nombre_postulante"));
            dto.setCorreoPostulante(rs.getString("correo_postulante"));
            dto.setEstadoValidacion(rs.getString("estado_validacion"));
            dto.setObservaciones(   rs.getString("observaciones"));

            // Timestamp → LocalDateTime con null safety
            Timestamp fechaPost = rs.getTimestamp("fecha_postulacion");
            dto.setFechaPostulacion(fechaPost != null
                    ? fechaPost.toLocalDateTime() : null);

            return dto;
        }
    }

    public List<ReportePostulacionDTO> ejecutarReporte(
            FiltroReportePostulacionDTO filtro) {

        String sql = """
                SELECT *
                FROM postulaciones.fn_reporte_postulaciones(
                    ?::varchar,
                    ?::date,
                    ?::date,
                    ?::integer,
                    ?::integer,
                    ?::integer
                )
                """;

        return jdbcTemplate.query(
                sql,
                new ReportePostulacionRowMapper(),
                // Orden exacto igual al de la función PostgreSQL
                filtro.getEstadoValidacion(),
                filtro.getFechaInicio() != null
                        ? Date.valueOf(filtro.getFechaInicio()) : null,
                filtro.getFechaFin() != null
                        ? Date.valueOf(filtro.getFechaFin()) : null,
                filtro.getIdCiudad(),
                filtro.getIdCategoria(),
                filtro.getIdModalidad()
        );
    }
}