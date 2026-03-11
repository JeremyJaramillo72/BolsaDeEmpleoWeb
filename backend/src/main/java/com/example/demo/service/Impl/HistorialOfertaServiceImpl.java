package com.example.demo.service.Impl;

import com.example.demo.dto.AuditoriaOfertaDTO;
import com.example.demo.model.HistorialOferta;
import com.example.demo.repository.HistorialOfertaRepository;
import com.example.demo.service.HistorialOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialOfertaServiceImpl implements HistorialOfertaService {

    private final HistorialOfertaRepository historialOfertaRepository;

    @Override
    public List<AuditoriaOfertaDTO> getOfertasParaAuditoria() {
        List<Object[]> resultados = historialOfertaRepository.obtenerResumenAuditoriaObj();

        return resultados.stream().map(obj -> {
            AuditoriaOfertaDTO dto = new AuditoriaOfertaDTO();
            // Mapeamos por el índice de la columna en el SELECT
            dto.setIdHistorial(((Number) obj[0]).longValue());
            dto.setIdOferta(((Number) obj[1]).longValue());
            dto.setTituloOferta((String) obj[2]);
            dto.setEmpresa((String) obj[3]);
            dto.setUsuarioBd((String) obj[4]);
            dto.setAccion((String) obj[5]);
            dto.setEstadoActual((String) obj[6]);

            // ¡AQUÍ ESTÁ LA MAGIA CORREGIDA!
            // Validamos qué tipo de dato está devolviendo realmente Hibernate
            if (obj[7] != null) {
                if (obj[7] instanceof java.sql.Timestamp) {
                    dto.setFechaHora(((java.sql.Timestamp) obj[7]).toLocalDateTime());
                } else if (obj[7] instanceof java.time.LocalDateTime) {
                    dto.setFechaHora((java.time.LocalDateTime) obj[7]);
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<HistorialOferta> getHistorialByOferta(Long idOferta) {
        return historialOfertaRepository.findByOferta_IdOfertaOrderByFechaHoraDesc(idOferta);
    }
}