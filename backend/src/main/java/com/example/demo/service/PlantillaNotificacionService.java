package com.example.demo.service;

import com.example.demo.dto.PlantillaNotificacionDTO;
import com.example.demo.model.Auditoria;
import com.example.demo.model.PlantillaNotificacion;
import com.example.demo.model.Seguridad;
import com.example.demo.model.Usuario;
import com.example.demo.repository.AuditoriaRepository;
import com.example.demo.repository.PlantillaNotificacionRepository;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlantillaNotificacionService {

    private final PlantillaNotificacionRepository plantillaRepo;
    private final AuditoriaRepository auditoriaRepo;
    private final SeguridadDbRepository seguridadRepo;
    private final UsuarioRepository usuarioRepo;
    private final ObjectMapper objectMapper;

    /**
     * Obtener una plantilla activa por tipo
     */
    @Transactional(readOnly = true)
    public PlantillaNotificacionDTO obtenerPlantilla(String tipo) {
        PlantillaNotificacion plantilla = plantillaRepo
                .findByTipoAndActivo(tipo, true)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada: " + tipo));

        return mapearADTO(plantilla);
    }

    /**
     * Obtener todas las plantillas activas
     */
    @Transactional(readOnly = true)
    public List<PlantillaNotificacionDTO> obtenerPlantillas() {
        List<PlantillaNotificacion> plantillas = plantillaRepo.findByActivoOrderByTipo(true);
        return plantillas.stream()
                .map(this::mapearADTO)
                .toList();
    }

    /**
     * Actualizar plantilla y registrar en auditoría
     */

    /**
     * Actualizar plantilla (La auditoría la maneja el Trigger en la BD)
     */
    @Transactional
    public void actualizarPlantilla(Integer idPlantilla, String titulo, String contenido) {
        PlantillaNotificacion plantilla = plantillaRepo
                .findById(idPlantilla)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada: " + idPlantilla));

        plantilla.setTitulo(titulo);
        plantilla.setContenido(contenido);

        // Al guardar, el Trigger AFTER UPDATE saltará en tu base de datos
        // y registrará el cambio en la tabla de auditoría con el usuario de BD actual.
        plantillaRepo.save(plantilla);

        log.info("✅ Plantilla actualizada: " + plantilla.getTipo());
    }

    /**
     * Obtener historial de cambios usando Auditoria
     */
    @Transactional(readOnly = true)
    public List<PlantillaNotificacionDTO.HistorialItem> obtenerHistorial(Integer idPlantilla) {
        PlantillaNotificacion plantilla = plantillaRepo
                .findById(idPlantilla)
                .orElse(null);

        if (plantilla == null) {
            return new ArrayList<>();
        }

        List<Auditoria> registros = auditoriaRepo
                .findByTablaAfectadaAndIdRegistroAfectadoOrderByFechaHoraDesc(
                        "plantilla_notificacion",
                        (int) idPlantilla.longValue() // Aseguramos el casteo a Long
                );

        List<PlantillaNotificacionDTO.HistorialItem> items = new ArrayList<>();
        for (Auditoria reg : registros) {
            try {
                PlantillaNotificacionDTO.HistorialItem item = new PlantillaNotificacionDTO.HistorialItem();

                Seguridad seguridad = seguridadRepo.findById(reg.getIdSeguridad()).orElse(null);
                if (seguridad != null && seguridad.getUsuario() != null) {
                    item.setAdminNombre(seguridad.getUsuario().getNombre());
                    item.setAdminEmail(seguridad.getUsuario().getCorreo());
                } else {
                    item.setAdminNombre("Usuario Eliminado");
                    item.setAdminEmail("N/A");
                }

                item.setIdHistorial(reg.getIdAuditoria());
                item.setAccion(reg.getAccion());
                item.setFechaCreacion(reg.getFechaHora());

                if (reg.getDatosAnteriores() != null) {
                    Map<String, Object> datosAnt = objectMapper.readValue(reg.getDatosAnteriores(), Map.class);
                    Object tituloAnt = datosAnt.get("titulo");
                    Object contenidoAnt = datosAnt.get("contenido");
                    if (tituloAnt != null) item.setTituloAnterior(tituloAnt.toString());
                    if (contenidoAnt != null) item.setContenidoAnterior(contenidoAnt.toString());
                }

                if (reg.getDatosNuevos() != null) {
                    Map<String, Object> datosNue = objectMapper.readValue(reg.getDatosNuevos(), Map.class);
                    Object tituloNue = datosNue.get("titulo");
                    Object contenidoNue = datosNue.get("contenido");
                    Object ipAddr = datosNue.get("ipAddress");
                    if (tituloNue != null) item.setTituloNuevo(tituloNue.toString());
                    if (contenidoNue != null) item.setContenidoNuevo(contenidoNue.toString());
                    if (ipAddr != null) item.setIpAddress(ipAddr.toString());
                }

                items.add(item);
            } catch (Exception e) {
                log.error("Error procesando historial: " + e.getMessage());
            }
        }
        return items;
    }

    private PlantillaNotificacionDTO mapearADTO(PlantillaNotificacion plantilla) {
        return new PlantillaNotificacionDTO(
                plantilla.getIdPlantilla(),
                plantilla.getTipo(),
                plantilla.getTitulo(),
                plantilla.getContenido(),
                plantilla.getActivo(),
                plantilla.getFechaCreacion(),
                plantilla.getFechaModificacion()
        );
    }
}