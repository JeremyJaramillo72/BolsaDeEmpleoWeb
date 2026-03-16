package com.example.demo.service.Impl;

import com.example.demo.dto.AuditoriaOfertaDTO;
import com.example.demo.dto.TrazabilidadOfertaDTO;
import com.example.demo.repository.HistorialOfertaRepository;
import com.example.demo.service.HistorialOfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialOfertaServiceImpl implements HistorialOfertaService {

    private final HistorialOfertaRepository historialOfertaRepository;

    @Override
    public List<AuditoriaOfertaDTO> getOfertasParaAuditoria() {
        // Le pasamos un JSON vacío porque la función no requiere filtros específicos
        List<Object[]> resultados = historialOfertaRepository.obtenerResumenAuditoriaObj("{}");

        return resultados.stream().map(obj -> {
            AuditoriaOfertaDTO dto = new AuditoriaOfertaDTO();
            dto.setIdHistorial(((Number) obj[0]).longValue());
            dto.setIdOferta(((Number) obj[1]).longValue());
            dto.setTituloOferta((String) obj[2]);
            dto.setEmpresa((String) obj[3]);
            dto.setUsuarioBd((String) obj[4]);
            dto.setAccion((String) obj[5]);
            dto.setEstadoActual((String) obj[6]);

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
    public List<TrazabilidadOfertaDTO> getHistorialByOferta(Long idOferta) {
        // Armamos el JSON con el parámetro
        String jsonParam = "{\"id_oferta\": " + idOferta + "}";

        List<Object[]> resultados = historialOfertaRepository.obtenerTrazabilidadPorOfertaObj(jsonParam);

        return resultados.stream().map(obj -> {
            TrazabilidadOfertaDTO dto = new TrazabilidadOfertaDTO();
            dto.setIdHistorial(((Number) obj[0]).longValue());
            dto.setAccion((String) obj[1]);

            if (obj[2] != null) {
                if (obj[2] instanceof java.sql.Timestamp) {
                    dto.setFechaHora(((java.sql.Timestamp) obj[2]).toLocalDateTime());
                } else if (obj[2] instanceof java.time.LocalDateTime) {
                    dto.setFechaHora((java.time.LocalDateTime) obj[2]);
                }
            }

            dto.setEjecutor((String) obj[3]);
            dto.setCampoModificado((String) obj[4]);
            // Los JSONB de Postgres a veces llegan como PGobject, con toString() extraemos el String limpio
            dto.setValoresAnteriores(obj[5] != null ? obj[5].toString() : null);
            dto.setValoresNuevos(obj[6] != null ? obj[6].toString() : null);

            return dto;
        }).collect(Collectors.toList());
    }
}