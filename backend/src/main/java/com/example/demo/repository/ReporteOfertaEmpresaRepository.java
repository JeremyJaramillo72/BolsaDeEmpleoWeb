package com.example.demo.repository;

import com.example.demo.dto.FiltroReporteOfertaEmpresaDTO;
import com.example.demo.dto.ReporteOfertaEmpresaDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ReporteOfertaEmpresaRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReporteOfertaEmpresaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ReporteOfertaEmpresaDTO> ejecutarReporte(
            FiltroReporteOfertaEmpresaDTO filtro) {

        // CRÍTICO: el orden de los ? debe coincidir exactamente con
        // el orden de parámetros declarados en el stored procedure:
        // p_id_empresa, p_top, p_id_ciudad, p_id_categoria, p_id_modalidad,
        // p_id_jornada, p_fecha_inicio, p_fecha_fin, p_salario_min,
        // p_salario_max, p_estado_oferta
        String sql = """
            SELECT * FROM empresas.fn_reporte_ofertas_empresa(
                ?::integer,
                ?::integer,
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
                new ReporteOfertaEmpresaRowMapper(),
                filtro.getIdEmpresa(),
                filtro.getTop(),
                filtro.getIdCiudad(),
                filtro.getIdCategoria(),
                filtro.getIdModalidad(),
                filtro.getIdJornada(),
                filtro.getFechaInicio(),
                filtro.getFechaFin(),
                filtro.getSalarioMin(),
                filtro.getSalarioMax(),
                filtro.getEstadoOferta()
        );
    }

    // ─── RowMapper ───────────────────────────────────────────────────────
    private static class ReporteOfertaEmpresaRowMapper
            implements RowMapper<ReporteOfertaEmpresaDTO> {

        @Override
        public ReporteOfertaEmpresaDTO mapRow(ResultSet rs, int rowNum)
                throws SQLException {

            // Conversión segura de java.sql.Date a LocalDate
            java.sql.Date fechaInicioSql = rs.getDate("fecha_inicio");
            java.sql.Date fechaCierreSql = rs.getDate("fecha_cierre");

            return ReporteOfertaEmpresaDTO.builder()
                    .idOferta(rs.getLong("id_oferta"))
                    .titulo(rs.getString("titulo"))
                    .nombreCategoria(rs.getString("nombre_categoria"))
                    .nombreModalidad(rs.getString("nombre_modalidad"))
                    .nombreJornada(rs.getString("nombre_jornada"))
                    .nombreCiudad(rs.getString("nombre_ciudad"))
                    .salarioMin(rs.getBigDecimal("salario_min"))
                    .salarioMax(rs.getBigDecimal("salario_max"))
                    .fechaInicio(fechaInicioSql != null
                            ? fechaInicioSql.toLocalDate() : null)
                    .fechaCierre(fechaCierreSql != null
                            ? fechaCierreSql.toLocalDate() : null)
                    .estadoOferta(rs.getString("estado_oferta"))
                    .cantidadVacantes(rs.getInt("cantidad_vacantes"))
                    .experienciaMinima(rs.getInt("experiencia_minima"))
                    .totalPostulaciones(rs.getLong("total_postulaciones"))
                    .postulacionesPendientes(rs.getLong("postulaciones_pendientes"))
                    .postulacionesAceptadas(rs.getLong("postulaciones_aceptadas"))
                    .postulacionesRechazadas(rs.getLong("postulaciones_rechazadas"))
                    .build();
        }
    }
}
