package com.example.demo.service;

import com.example.demo.dto.PerfilAdminDTO;
import com.example.demo.repository.PerfilAdminRepository;
import com.example.demo.repository.UsuarioImagenRepository;
import com.example.demo.service.Impl.CloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PerfilAdminService {

    private final PerfilAdminRepository   repository;
    private final UsuarioImagenRepository imagenRepository;
    private final CloudinaryService       cloudinaryService;
    private final ObjectMapper            objectMapper;

    // ── Obtener perfil ────────────────────────────────────────────────────
    public PerfilAdminDTO obtenerPerfil(Long idUsuario) {
        List<Object[]> rows = repository.obtenerPerfil(idUsuario);
        if (rows.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado: " + idUsuario);
        }
        Object[] r = rows.get(0);

        // ✅ fechaNacimiento: convertir java.sql.Date o cualquier tipo a String "YYYY-MM-DD"
        String fechaStr = null;
        if (r[6] != null) {
            if (r[6] instanceof java.sql.Date) {
                fechaStr = ((java.sql.Date) r[6]).toLocalDate().toString();
            } else {
                fechaStr = r[6].toString();
                // Tomar solo la parte de fecha si viene con hora (ej: "2005-11-12 00:00:00")
                if (fechaStr.length() > 10) fechaStr = fechaStr.substring(0, 10);
            }
        }

        return PerfilAdminDTO.builder()
                .idUsuario(toLong(r[0]))
                .nombre(str(r[1]))
                .apellido(str(r[2]))
                .correo(str(r[3]))
                .telefono(str(r[4]))
                .genero(str(r[5]))
                .fechaNacimiento(fechaStr)
                .urlImagen(str(r[7]))
                .build();
    }

    // ── Actualizar datos generales ────────────────────────────────────────
    public PerfilAdminDTO actualizarPerfil(Long idUsuario, PerfilAdminDTO dto) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            if (dto.getNombre()          != null) map.put("nombre",           dto.getNombre());
            if (dto.getApellido()        != null) map.put("apellido",         dto.getApellido());
            if (dto.getTelefono()        != null) map.put("telefono",         dto.getTelefono());
            if (dto.getGenero()          != null) map.put("genero",           dto.getGenero());
            if (dto.getFechaNacimiento() != null) map.put("fecha_nacimiento", dto.getFechaNacimiento());

            String json = objectMapper.writeValueAsString(map);
            repository.actualizarPerfil(idUsuario, json);
            return obtenerPerfil(idUsuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar perfil: " + e.getMessage(), e);
        }
    }

    // ── Actualizar foto ───────────────────────────────────────────────────
    public PerfilAdminDTO actualizarFoto(Long idUsuario, MultipartFile archivo) throws IOException {
        if (archivo.isEmpty()) throw new IllegalArgumentException("El archivo está vacío");
        String ct = archivo.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new IllegalArgumentException("Solo se permiten imágenes");

        String urlSegura = cloudinaryService.subirImagenEArchivo(archivo);
        imagenRepository.guardarUrlImagen(idUsuario.intValue(), urlSegura);
        return obtenerPerfil(idUsuario);
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private String str(Object o) { return o != null ? o.toString() : null; }
    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Long)    return (Long) o;
        if (o instanceof Integer) return ((Integer) o).longValue();
        return Long.parseLong(o.toString());
    }
}