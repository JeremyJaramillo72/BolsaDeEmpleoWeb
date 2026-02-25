package com.example.demo.service;

import com.example.demo.dto.ReportePostulacionDTO;
import com.example.demo.repository.ReportePostulacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportePostulacionService {
    @Autowired
    private ReportePostulacionRepository repository;

    public List<ReportePostulacionDTO> obtenerReporte(Long idOferta, Integer idCarrera, String estado,
                                                      LocalDate desde, LocalDate hasta, Integer page, Integer size) {
        // Paginación por defecto
        int limit = (size != null) ? size : 10;
        int offset = (page != null) ? page * limit : 0;

        List<Object[]> rows = repository.ejecutarReporte(idOferta, idCarrera, estado, desde, hasta, limit, offset);

        return rows.stream().map(row -> new ReportePostulacionDTO(
                ((Number) row[0]).longValue(),      // id_postulacion
                (String) row[1],                    // oferta_titulo
                (String) row[2],                    // usuario_nombre
                (String) row[3],                    // carrera_nombre
                (String) row[4],                    // estado_validacion
                row[5] != null ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null, // fecha_postulacion
                ((Number) row[6]).longValue()       // total_registros (COUNT OVER)
        )).collect(Collectors.toList());
    }
}