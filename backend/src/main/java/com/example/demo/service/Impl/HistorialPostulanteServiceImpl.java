package com.example.demo.service.Impl;

import com.example.demo.dto.AuditoriaPostulanteDTO;
import com.example.demo.dto.TrazabilidadPostulanteDTO;
import com.example.demo.repository.HistorialPostulanteRepository;
import com.example.demo.service.HistorialPostulanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialPostulanteServiceImpl implements HistorialPostulanteService {

    private final HistorialPostulanteRepository repository;

    @Override
    public List<AuditoriaPostulanteDTO> getPostulantesAuditoria() {
        List<Object[]> resultados = repository.obtenerPostulantesAuditoriaObj("{}");

        return resultados.stream().map(obj -> {
            AuditoriaPostulanteDTO dto = new AuditoriaPostulanteDTO();
            dto.setIdUsuario(((Number) obj[0]).longValue());
            dto.setIdPerfilAcademico(obj[1] != null ? ((Number) obj[1]).intValue() : null);
            dto.setNombrePostulante((String) obj[2]);
            dto.setCorreo((String) obj[3]);

            if (obj[4] != null) {
                if (obj[4] instanceof java.sql.Timestamp) {
                    dto.setUltimaModificacion(((java.sql.Timestamp) obj[4]).toLocalDateTime());
                } else if (obj[4] instanceof java.time.LocalDateTime) {
                    dto.setUltimaModificacion((java.time.LocalDateTime) obj[4]);
                }
            }

            dto.setTotalMovimientos(((Number) obj[5]).longValue());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<TrazabilidadPostulanteDTO> getHistorialByPerfil(Integer idPerfilAcademico) {
        String jsonParam = "{\"id_perfil_academico\": " + idPerfilAcademico + "}";
        List<Object[]> resultados = repository.obtenerTrazabilidadPorPerfilObj(jsonParam);

        return resultados.stream().map(obj -> {
            TrazabilidadPostulanteDTO dto = new TrazabilidadPostulanteDTO();
            dto.setIdHistorial(((Number) obj[0]).longValue());
            dto.setSeccion((String) obj[1]);
            dto.setAccion((String) obj[2]);

            if (obj[3] != null) {
                if (obj[3] instanceof java.sql.Timestamp) {
                    dto.setFechaHora(((java.sql.Timestamp) obj[3]).toLocalDateTime());
                } else if (obj[3] instanceof java.time.LocalDateTime) {
                    dto.setFechaHora((java.time.LocalDateTime) obj[3]);
                }
            }

            dto.setEjecutor((String) obj[4]);
            dto.setCamposModificados((String) obj[5]);
            dto.setValoresAnteriores(obj[6] != null ? obj[6].toString() : null);
            dto.setValoresNuevos(obj[7] != null ? obj[7].toString() : null);

            return dto;
        }).collect(Collectors.toList());
    }
}