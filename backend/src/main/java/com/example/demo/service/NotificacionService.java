package com.example.demo.service;

import com.example.demo.dto.IOfertaResumen;
import com.example.demo.dto.NotificacionDTO;
import com.example.demo.model.Notificacion;
import com.example.demo.model.Usuario;
import com.example.demo.repository.NotificacionRepository;
import com.example.demo.repository.OfertaLaboralRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.service.EmailService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepo;
    private final UsuarioRepository usuarioRepo;
    private final OfertaLaboralRepository ofertaRepo;
    private final SimpMessagingTemplate messagingTemplate; // Para WebSockets

    //i no tienes EmailService aún, comenta esta línea para que no te dé error de que no lo encuentra
    private final EmailService emailService;

    private final Map<String, String> templates = Map.of(
            "postulacion_aprobada", "¡Felicidades! Tu postulación a '{oferta}' fue APROBADA por {empresa}.",
            "oferta_aprobada", "Tu oferta de empleo '{titulo}' ha sido marcada como {estado} y ya es visible.",
            "nueva_oferta", "Nueva oferta publicada: '{titulo}' en {empresa}.",
            "nueva_postulacion", "¡Tienes un nuevo candidato! Alguien se ha postulado a tu oferta '{titulo}'.",
            "feedback_postulacion", "La empresa {empresa} ha dejado feedback en tu postulación a '{oferta}'.",
            "oferta_pendiente", "La empresa {empresa} ha publicado una nueva oferta: '{titulo}'. Requiere revisión.",
            "nueva_oferta_zona", "Hola {nombre}, hay una nueva oferta '{titulo}' disponible en tu zona ({provincia})."
    );

    @Transactional
    public void crearYEnviarNotificacion(Long idUsuario, String tipo, Map<String, String> variables, Map<String, Object> datosJson, String enlace, String icono) {
        Usuario usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Generar Mensaje
        String plantilla = templates.getOrDefault(tipo, "Tienes una nueva notificación");
        String mensajeFinal = plantilla;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            mensajeFinal = mensajeFinal.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        // 2. Guardar en PostgreSQL
        Notificacion notif = new Notificacion();
        notif.setUsuario(usuario);
        notif.setTitulo(generarTituloPorTipo(tipo));
        notif.setMensaje(mensajeFinal);
        notif.setTipo(tipo);
        notif.setIcono(icono);
        notif.setEnlace(enlace);
        notif.setDatos(datosJson);
        notif.setLeida(false); // Por si acaso aseguramos el false

        Notificacion guardada = notificacionRepo.save(notif);

        // 3. Mapear a DTO
        NotificacionDTO dto = mapearADTO(guardada);

        // 4. PUSH por WebSocket (usando topic específico por usuario)
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notificaciones/" + idUsuario,
                    dto
            );
        } catch (Exception e) {
            System.err.println("Error enviando WebSocket para usuario " + idUsuario + ": " + e.getMessage());
        }

        // 5. Email condicional (no debe reventar la transaccion si falla)
        try {
            if (tipo.equals("postulacion_aprobada") || tipo.equals("proceso_entrevista")) {
                emailService.sendSimpleEmail(usuario.getCorreo(), dto.getTitulo(), dto.getMensaje());
            }
        } catch (Exception e) {
            System.err.println("Error enviando email a " + usuario.getCorreo() + ": " + e.getMessage());
        }
        
    }

    private String generarTituloPorTipo(String tipo) {
        return switch (tipo) {
            case "postulacion_aprobada" -> "Postulacion Aprobada";
            case "oferta_aprobada" -> "Oferta Aprobada";
            case "nueva_oferta" -> "Nueva Oferta de Empleo";
            case "nueva_postulacion" -> "Nueva Postulacion Recibida";
            case "feedback_postulacion" -> "Feedback de Postulacion";
            case "oferta_pendiente" -> "Oferta Pendiente de Revision";
            case "nueva_oferta_zona" -> "Nueva Oferta en tu Zona";
            default -> "Nueva Notificacion";
        };
    }

    /**
     * Envía una notificación a todos los usuarios que tengan el rol indicado.
     * Usa REQUIRES_NEW para que se ejecute en transacción independiente,
     * evitando que un fallo aquí contamine la transacción del llamador.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarUsuariosPorRol(String nombreRol, String tipo, Map<String, String> variables, Map<String, Object> datosJson, String enlace, String icono) {
        List<Usuario> usuarios = usuarioRepo.findByRol_NombreRol(nombreRol);
        for (Usuario u : usuarios) {
            try {
                crearYEnviarNotificacion(u.getIdUsuario(), tipo, variables, datosJson, enlace, icono);
            } catch (Exception e) {
                System.err.println("Error notificando a usuario " + u.getIdUsuario() + " (" + nombreRol + "): " + e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<NotificacionDTO> obtenerNotificacionesUsuario(Long idUsuario) {
        return notificacionRepo.findByUsuarioId(idUsuario)
                .stream().map(this::mapearADTO).collect(Collectors.toList());
    }

    @Transactional
    public void marcarComoLeida(Integer idNotificacion) {
        Notificacion notif = notificacionRepo.findById(idNotificacion).orElseThrow();
        notif.setLeida(true);
        notificacionRepo.save(notif);
    }

    @Transactional
    public void marcarTodasLeidas(Long idUsuario) {
        notificacionRepo.marcarTodasComoLeidas(idUsuario);
    }

    private NotificacionDTO mapearADTO(Notificacion n) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setIdNotificacion(n.getIdNotificacion());
        dto.setTitulo(n.getTitulo());
        dto.setMensaje(n.getMensaje());
        dto.setTipo(n.getTipo());
        dto.setIcono(n.getIcono());
        dto.setEnlace(n.getEnlace());
        dto.setDatos(n.getDatos());
        dto.setLeida(n.getLeida());
        dto.setFechaCreacion(n.getFechaCreacion());
        return dto;
    }

    /**
     * Verifica si hay ofertas pendientes de revisión y crea una notificación
     * para el admin si no tiene ya una sin leer. Se ejecuta al cargar notificaciones.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void verificarYNotificarOfertasPendientes(Long idUsuario) {
        Usuario usuario = usuarioRepo.findById(idUsuario).orElse(null);
        if (usuario == null || usuario.getRol() == null) return;

        String rol = usuario.getRol().getNombreRol();
        if (!List.of("ADMINISTRADOR", "SUPERVISOR", "GERENTE").contains(rol)) return;

        // Consultar ofertas pendientes en la BD
        List<IOfertaResumen> pendientes = ofertaRepo.listarPorEstadoSP("pendiente");
        if (pendientes.isEmpty()) return;

        // No crear duplicados: verificar si ya tiene una notificación pendiente sin leer
        boolean yaExiste = notificacionRepo.existsByUsuario_IdUsuarioAndTipoAndLeidaFalse(idUsuario, "oferta_pendiente");
        if (yaExiste) return;

        // Crear notificación con la cantidad real
        int cantidad = pendientes.size();
        String mensaje = "Hay " + cantidad + " oferta(s) pendiente(s) de revisión.";

        Notificacion notif = new Notificacion();
        notif.setUsuario(usuario);
        notif.setTitulo("Ofertas Pendientes de Revisión");
        notif.setMensaje(mensaje);
        notif.setTipo("oferta_pendiente");
        notif.setIcono("assignment_late");
        notif.setEnlace("/menu-principal/PanelAdmi/ValidarOfertas");
        notif.setDatos(Map.of("cantidad", cantidad));
        notif.setLeida(false);

        Notificacion guardada = notificacionRepo.save(notif);

        // Push por WebSocket
        try {
            NotificacionDTO dto = mapearADTO(guardada);
            messagingTemplate.convertAndSend("/topic/notificaciones/" + idUsuario, dto);
        } catch (Exception e) {
            System.err.println("Error enviando WebSocket de ofertas pendientes: " + e.getMessage());
        }
    }
}