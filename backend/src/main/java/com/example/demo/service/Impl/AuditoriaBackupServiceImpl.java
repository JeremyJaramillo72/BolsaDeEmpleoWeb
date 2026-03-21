package com.example.demo.service.Impl;

import com.example.demo.dto.ResumenBackupDTO;
import com.example.demo.dto.DetalleBackupDTO;
import com.example.demo.repository.AuditoriaBackupRepository;
import com.example.demo.service.AuditoriaBackupService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AuditoriaBackupServiceImpl implements AuditoriaBackupService {

    @Autowired
    private AuditoriaBackupRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public List<ResumenBackupDTO> obtenerResumen(Map<String, Object> parametros) {
        List<ResumenBackupDTO> listaFinal = new ArrayList<>();
        try {
            // Si el map está vacío, mandamos "{}" literal a Postgres
            String jsonParams = parametros.isEmpty() ? "{}" : objectMapper.writeValueAsString(parametros);
            List<Object[]> resultados = repository.obtenerResumenAuditoriaBD(jsonParams);

            for (Object[] fila : resultados) {
                listaFinal.add(new ResumenBackupDTO(
                        fila[0] != null ? ((Number) fila[0]).longValue() : null,
                        fila[1] != null ? fila[1].toString() : null,
                        fila[2] != null ? ((Number) fila[2]).longValue() : 0L,
                        convertirAFecha(fila[3]) // ✅ Usamos el conversor seguro
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener el resumen de backups");
        }
        return listaFinal;
    }

    @Override
    public List<DetalleBackupDTO> obtenerDetalle(Map<String, Object> parametros) {
        List<DetalleBackupDTO> listaFinal = new ArrayList<>();
        try {
            String jsonParams = objectMapper.writeValueAsString(parametros);
            List<Object[]> resultados = repository.obtenerDetalleAuditoriaBD(jsonParams);

            for (Object[] fila : resultados) {
                listaFinal.add(new DetalleBackupDTO(
                        fila[0] != null ? ((Number) fila[0]).longValue() : null,
                        convertirAFecha(fila[1]), // ✅ Usamos el conversor seguro
                        fila[2] != null ? fila[2].toString() : null,
                        fila[3] != null ? fila[3].toString() : null,
                        fila[4] != null ? fila[4].toString() : null,
                        fila[5] != null ? ((Number) fila[5]).longValue() : 0L,
                        fila[6] != null ? fila[6].toString() : null
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener el detalle de backups");
        }
        return listaFinal;
    }

    // ✅ Método mágico para evitar el ClassCastException
    private Timestamp convertirAFecha(Object valorBD) {
        if (valorBD == null) return null;
        if (valorBD instanceof Timestamp) {
            return (Timestamp) valorBD;
        } else if (valorBD instanceof LocalDateTime) {
            return Timestamp.valueOf((LocalDateTime) valorBD);
        }
        // Por si acaso viene como String en algún formato raro
        return Timestamp.valueOf(valorBD.toString());
    }
}