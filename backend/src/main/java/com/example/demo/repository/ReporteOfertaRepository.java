package com.example.demo.repository;

import com.example.demo.dto.FiltroReporteOfertaDTO;
import com.example.demo.dto.ReporteOfertaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReporteOfertaRepository {

    private final JdbcTemplate jdbcTemplate;

    // RowMapper separado — más limpio y reutilizable
    private static final class ReporteOfertaRowMapper
            implements RowMapper<ReporteOfertaDTO> {

        @Override
        public ReporteOfertaDTO mapRow(ResultSet rs, int rowNum)
                throws SQLException {

            ReporteOfertaDTO dto = new ReporteOfertaDTO();

            dto.setIdOferta(rs.getLong("id_oferta"));
            dto.setTitulo(rs.getString("titulo"));
            dto.setNombreEmpresa(rs.getString("nombre_empresa"));
            dto.setNombreProvincia(rs.getString("nombre_provincia"));
            dto.setNombreCiudad(rs.getString("nombre_ciudad"));
            dto.setNombreModalidad(rs.getString("nombre_modalidad"));
            dto.setNombreJornada(rs.getString("nombre_jornada"));
            dto.setNombreCategoria(rs.getString("nombre_categoria"));

            // BigDecimal — puede ser null si la BD lo permite
            BigDecimal sMin = rs.getBigDecimal("salario_min");
            dto.setSalarioMin(rs.wasNull() ? null : sMin);

            BigDecimal sMax = rs.getBigDecimal("salario_max");
            dto.setSalarioMax(rs.wasNull() ? null : sMax);

            dto.setCantidadVacantes(rs.getInt("cantidad_vacantes"));
            dto.setExperienciaMinima(rs.getInt("experiencia_minima"));

            // Fechas — conversión segura de sql.Date a LocalDate
            Date fechaInicio = rs.getDate("fecha_inicio");
            dto.setFechaInicio(fechaInicio != null
                    ? fechaInicio.toLocalDate() : null);

            Date fechaCierre = rs.getDate("fecha_cierre");
            dto.setFechaCierre(fechaCierre != null
                    ? fechaCierre.toLocalDate() : null);

            dto.setEstadoOferta(rs.getString("estado_oferta"));

            // Timestamp — conversión segura a LocalDateTime
            Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");
            dto.setFechaCreacion(fechaCreacion != null
                    ? fechaCreacion.toLocalDateTime() : null);

            return dto;
        }
    }

    public List<ReporteOfertaDTO> ejecutarReporte(FiltroReporteOfertaDTO filtro) {

        // Parámetros posicionales con cast explícito en PostgreSQL
        // Cada ? corresponde exactamente a un parámetro de la función
        String sql = """
                SELECT *
                FROM ofertas.fn_reporte_ofertas_laborales(
                    ?::integer,
                    ?::integer,
                    ?::integer,
                    ?::integer,
                    ?::date,
                    ?::date,
                    ?::numeric,
                    ?::numeric,
                    ?::varchar
                )
                """;

        return jdbcTemplate.query(
                sql,
                new ReporteOfertaRowMapper(),
                // Orden exacto igual al de la función en PostgreSQL
                filtro.getIdCiudad(),
                filtro.getIdCategoria(),
                filtro.getIdModalidad(),
                filtro.getIdJornada(),
                // LocalDate → sql.Date para JDBC — null se pasa como null directamente
                filtro.getFechaInicio() != null
                        ? Date.valueOf(filtro.getFechaInicio()) : null,
                filtro.getFechaFin() != null
                        ? Date.valueOf(filtro.getFechaFin()) : null,
                filtro.getSalarioMin(),
                filtro.getSalarioMax(),
                filtro.getEstadoOferta()
        );
    }
}