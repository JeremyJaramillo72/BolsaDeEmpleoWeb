package com.example.demo.service;

import com.example.demo.dto.SistemaEmpresaDTO;
import com.example.demo.model.SistemaEmpresa;
import com.example.demo.repository.SistemaEmpresaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SistemaEmpresaService {

    private final SistemaEmpresaRepository repository;
    private final ObjectMapper             objectMapper;  // Bean estándar de Spring Boot

    // ── Obtener configuración actual ──────────────────────────────────────
    public SistemaEmpresaDTO obtenerConfiguracion() {
        SistemaEmpresa cfg = repository.findById(1)
                .orElseThrow(() -> new RuntimeException(
                        "Configuración del sistema no encontrada. " +
                                "Ejecuta configuracion_sistema.sql en pgAdmin."));
        return toDTO(cfg);
    }

    // ── Actualizar datos generales ────────────────────────────────────────
    public SistemaEmpresaDTO actualizarConfiguracion(SistemaEmpresaDTO dto) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            if (dto.getNombreAplicativo()     != null) map.put("nombre_aplicativo",     dto.getNombreAplicativo());
            if (dto.getDescripcion()          != null) map.put("descripcion",           dto.getDescripcion());
            if (dto.getCorreoSoporte()        != null) map.put("correo_soporte",        dto.getCorreoSoporte());
            if (dto.getTelefonoContacto()     != null) map.put("telefono_contacto",     dto.getTelefonoContacto());
            if (dto.getDireccionInstitucion() != null) map.put("direccion_institucion", dto.getDireccionInstitucion());

            String json = objectMapper.writeValueAsString(map);
            repository.actualizarConfiguracion(json);
            return obtenerConfiguracion();
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar configuración: " + e.getMessage(), e);
        }
    }

    // ── Guardar URL del logo en BD (lo llama el Controller tras subir a Cloudinary) ──
    // El controller ya hizo el upload — aquí solo persistimos la URL via SP JSONB.
    public void actualizarLogoUrl(String urlImagen) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("logo_url", urlImagen));
            repository.actualizarLogo(json);
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar URL del logo: " + e.getMessage(), e);
        }
    }

    // ── Mapeo Entity → DTO ────────────────────────────────────────────────
    private SistemaEmpresaDTO toDTO(SistemaEmpresa cfg) {
        return SistemaEmpresaDTO.builder()
                .idConfig(cfg.getIdConfig())
                .nombreAplicativo(cfg.getNombreAplicativo())
                .descripcion(cfg.getDescripcion())
                .logoUrl(cfg.getLogoUrl())
                .correoSoporte(cfg.getCorreoSoporte())
                .telefonoContacto(cfg.getTelefonoContacto())
                .direccionInstitucion(cfg.getDireccionInstitucion())
                .fechaCreacion(cfg.getFechaCreacion())
                .fechaActualizacion(cfg.getFechaActualizacion())
                .build();
    }
}