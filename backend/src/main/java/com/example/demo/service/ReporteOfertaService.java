package com.example.demo.service;

import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.repository.ReporteOfertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteOfertaService {

    @Autowired
    private ReporteOfertaRepository reporteRepository;

    // MÉTODO UNIFICADO: Usado tanto para vista previa como para exportar
    public List<ReporteOfertaDTO> obtenerReporteDinamico(
            Integer idCiudad, Integer idCategoria, String busqueda,
            Integer pagina, Integer tamano) {

        // Si no mandan página/tamaño (como en exportación), ponemos valores por defecto
        int limit = (tamano != null) ? tamano : 1000;
        int offset = (pagina != null) ? pagina * limit : 0;

        List<Object[]> resultados = reporteRepository.consultarReporteDinamico(
                idCiudad, null, idCategoria, null, null, null, busqueda, limit, offset
        );

        return resultados.stream().map(row -> new ReporteOfertaDTO(
                row[0] != null ? ((Number) row[0]).longValue() : null,
                (String) row[1],
                (String) row[2],
                (String) row[3],
                (String) row[4],
                (String) row[5],
                (String) row[6],
                (BigDecimal) row[7],
                (BigDecimal) row[8],
                (BigDecimal) row[9],
                row[10] != null ? ((Date) row[10]).toLocalDate() : null,
                row[11] != null ? ((Date) row[11]).toLocalDate() : null,
                row[12] != null ? ((Number) row[12]).longValue() : 0L
        )).collect(Collectors.toList());
    }
}