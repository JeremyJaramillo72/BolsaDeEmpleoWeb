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
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    private final Map<String, String> templates = Map.of(
            "postulacion_aprobada", "¡Felicidades! Tu postulación a '{oferta}' fue APROBADA por {empresa}.",
            "oferta_aprobada", "Tu oferta de empleo '{titulo}' ha sido marcada como {estado} y ya es visible.",
            "nueva_oferta", "Nueva oferta publicada: '{titulo}' en {empresa}.",
            "nueva_postulacion", "¡Tienes un nuevo candidato! Alguien se ha postulado a tu oferta '{titulo}'.",
            "feedback_postulacion", "La empresa {empresa} ha dejado feedback en tu postulación a '{oferta}'.",
            "oferta_pendiente", "La empresa {empresa} ha publicado una nueva oferta: '{titulo}'. Requiere revisión.",
            "nueva_oferta_zona", "Hola {nombre}, hay una nueva oferta '{titulo}' disponible en tu zona ({provincia}).",
            "empresa_pendiente_aprobacion", "Se ha registrado una nueva empresa: '{nombreEmpresa}'. Requiere revisión.",
            "empresa_aprobada", "¡Felicidades! Tu empresa ha sido aprobada. Ya puedes iniciar sesión y publicar ofertas."
    );

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void crearYEnviarNotificacion(Long idUsuario, String tipo, Map<String, String> variables, Map<String, Object> datosJson, String enlace, String icono) {
        try {
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
            notif.setIcono(icono != null ? icono : "bell");
            notif.setEnlace(enlace != null ? enlace : "");
            notif.setDatos(datosJson != null ? datosJson : new java.util.HashMap<>());
            notif.setLeida(false);

            try {
                Notificacion guardada = notificacionRepo.save(notif);
                System.out.println("✅ Notificación guardada ID: " + guardada.getIdNotificacion() + " para usuario: " + idUsuario + " tipo=" + tipo);

                // 3. Mapear a DTO
                NotificacionDTO dto = mapearADTO(guardada);

                // 4. PUSH por WebSocket (usando topic específico por usuario)
                try {
                    messagingTemplate.convertAndSend(
                            "/topic/notificaciones/" + idUsuario,
                            dto
                    );
                } catch (Exception e) {
                    System.err.println("⚠️ Error enviando WebSocket para usuario " + idUsuario + ": " + e.getMessage());
                }

                // 5. Email condicional (no debe reventar la transaccion si falla)
                try {
                    boolean enviarEmail = switch (tipo) {
                        case "postulacion_aprobada",
                             "proceso_entrevista",
                             "oferta_aprobada",
                             "empresa_aprobada" -> true;   // notifica a empresa/postulante
                        default -> false;
                    };

                    if (enviarEmail) {
                        emailService.sendSimpleEmail(
                                usuario.getCorreo(),
                                dto.getTitulo(),
                                dto.getMensaje()
                        );
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Error enviando email a " + usuario.getCorreo() + ": " + e.getMessage());
                }


            } catch (Exception e) {
                System.err.println("❌ Error guardando notificación en BD: " + e.getMessage());
                e.printStackTrace();
                // NO lanzar excepción aquí, permitir que continúe
            }
        } catch (Exception e) {
            System.err.println("❌ Error en crearYEnviarNotificacion: " + e.getMessage());
            e.printStackTrace();
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
            case "empresa_pendiente_aprobacion" -> "Empresa Pendiente de Aprobacion";
            case "empresa_aprobada" -> "Empresa Aprobada";
            default -> "Nueva Notificacion";
        };
    }

    /**
     * Notificar a usuarios por rol - SIN COMPLICACIONES
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarAdminsDirecto(String tipo, Map<String, String> variables, Map<String, Object> datos, String enlace, String icono) {
        try {
            List<Usuario> admins = usuarioRepo.findByRol_NombreRol("Administrador");
            System.out.println("📧 Guardando notificación tipo: " + tipo + " para " + admins.size() + " admin(s)");

            for (Usuario admin : admins) {
                try {
                    Notificacion notif = new Notificacion();
                    notif.setUsuario(admin);

                    String plantilla = templates.getOrDefault(tipo, "Tienes una nueva notificación");
                    String mensaje = plantilla;
                    for (Map.Entry<String, String> entry : variables.entrySet()) {
                        mensaje = mensaje.replace("{" + entry.getKey() + "}", entry.getValue());
                    }

                    notif.setTitulo(generarTituloPorTipo(tipo));
                    notif.setMensaje(mensaje);
                    notif.setTipo(tipo);
                    notif.setIcono(icono != null ? icono : "bell");
                    notif.setEnlace(enlace != null ? enlace : "");
                    notif.setDatos(datos != null ? datos : new java.util.HashMap<>());
                    notif.setLeida(false);

                    Notificacion guardada = notificacionRepo.save(notif);

                    /// ///
                    try {
                        if (tipo.equals("empresa_pendiente_aprobacion") || tipo.equals("oferta_pendiente")) {
                            emailService.sendSimpleEmail(admin.getCorreo(), notif.getTitulo(), notif.getMensaje());
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Email admin no enviado: " + e.getMessage());
                    }
                    System.out.println("✅ Notificación ID " + guardada.getIdNotificacion() + " guardada para admin " + admin.getIdUsuario());

                } catch (Exception e) {
                    System.err.println("❌ Error guardando notificación para admin " + admin.getIdUsuario() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error en notificarAdminsDirecto: " + e.getMessage());
            e.printStackTrace();
        }
    }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarUsuariosPorRol(String nombreRol, String tipo, Map<String, String> variables, Map<String, Object> datosJson, String enlace, String icono) {
        try {
            System.out.println("🔍 Buscando usuarios con rol: '" + nombreRol + "'");

            List<Usuario> usuarios = usuarioRepo.findByRol_NombreRol(nombreRol);
            System.out.println("   ✓ Encontrados: " + usuarios.size());

            if (usuarios.isEmpty()) {
                System.out.println("   ⚠️ Sin usuarios para este rol");
                return;
            }

            for (Usuario u : usuarios) {
                try {
                    System.out.println("   📨 Guardando notificación para usuario: " + u.getIdUsuario());

                    // Crear notificación directamente sin llamar a crearYEnviarNotificacion
                    String plantilla = templates.getOrDefault(tipo, "Tienes una nueva notificación");
                    String mensajeFinal = plantilla;
                    for (Map.Entry<String, String> entry : variables.entrySet()) {
                        mensajeFinal = mensajeFinal.replace("{" + entry.getKey() + "}", entry.getValue());
                    }

                    Notificacion notif = new Notificacion();
                    notif.setUsuario(u);
                    notif.setTitulo(generarTituloPorTipo(tipo));
                    notif.setMensaje(mensajeFinal);
                    notif.setTipo(tipo);
                    notif.setIcono(icono != null ? icono : "bell");
                    notif.setEnlace(enlace != null ? enlace : "");
                    notif.setDatos(datosJson != null ? datosJson : new java.util.HashMap<>());
                    notif.setLeida(false);

                    Notificacion guardada = notificacionRepo.save(notif);
                    System.out.println("   ✅ Notificación ID: " + guardada.getIdNotificacion() + " guardada");

                    // Enviar WebSocket
                    try {
                        NotificacionDTO dto = mapearADTO(guardada);
                        messagingTemplate.convertAndSend("/topic/notificaciones/" + u.getIdUsuario(), dto);
                    } catch (Exception e) {
                        System.err.println("   ⚠️ WebSocket error: " + e.getMessage());
                    }
                } catch (Exception e) {
                    System.err.println("   ❌ Error guardando notificación: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error en notificarUsuariosPorRol: " + e.getMessage());
            e.printStackTrace();
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
        if (!List.of("Administrador", "Supervisor", "Gerente").contains(rol)) return;

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

        Map<String, Object> datosNotifOfertas = new java.util.HashMap<>();
        datosNotifOfertas.put("cantidad", cantidad);
        notif.setDatos(datosNotifOfertas);
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

    @Transactional(readOnly = true)
    public void debugMostrarRolesYUsuarios() {
        try {
            List<Usuario> usuariosAdmin = usuarioRepo.findByRol_NombreRol("Administrador");
            List<Usuario> usuariosSupervisor = usuarioRepo.findByRol_NombreRol("Supervisor");
            List<Usuario> usuariosGerente = usuarioRepo.findByRol_NombreRol("Gerente");

            System.out.println("\n=== DEBUG NOTIFICACIONES ===");
            System.out.println("👤 Usuarios ADMINISTRADOR encontrados: " + usuariosAdmin.size());
            for (Usuario u : usuariosAdmin) {
                System.out.println("   - ID: " + u.getIdUsuario() + " Nombre: " + u.getNombre());
            }

            System.out.println("👤 Usuarios SUPERVISOR encontrados: " + usuariosSupervisor.size());
            for (Usuario u : usuariosSupervisor) {
                System.out.println("   - ID: " + u.getIdUsuario() + " Nombre: " + u.getNombre());
            }

            System.out.println("👤 Usuarios GERENTE encontrados: " + usuariosGerente.size());
            for (Usuario u : usuariosGerente) {
                System.out.println("   - ID: " + u.getIdUsuario() + " Nombre: " + u.getNombre());
            }

            System.out.println("=== FIN DEBUG ===\n");
        } catch (Exception e) {
            System.err.println("Error en debug: " + e.getMessage());
            e.printStackTrace();
        }
    }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void verificarYNotificarEmpresasPendientes(Long idUsuario) {
        Usuario usuario = usuarioRepo.findById(idUsuario).orElse(null);
        if (usuario == null || usuario.getRol() == null) return;

        String rol = usuario.getRol().getNombreRol();
        if (!List.of("Administrador", "Supervisor", "Gerente").contains(rol)) return;

        // Contar empresas pendientes (estado_validacion = 'Pendiente')
        long cantidadPendientes = usuarioRepo.countByEstadoValidacion("Pendiente");
        if (cantidadPendientes == 0) return;

        // No crear duplicados: verificar si ya tiene una notificación pendiente sin leer
        boolean yaExiste = notificacionRepo.existsByUsuario_IdUsuarioAndTipoAndLeidaFalse(idUsuario, "empresa_pendiente_aprobacion");
        if (yaExiste) return;

        // Crear notificación con la cantidad real
        String mensaje = "Hay " + cantidadPendientes + " empresa(s) pendiente(s) de aprobación.";

        Notificacion notif = new Notificacion();
        notif.setUsuario(usuario);
        notif.setTitulo("Empresas Pendientes de Aprobación");
        notif.setMensaje(mensaje);
        notif.setTipo("empresa_pendiente_aprobacion");
        notif.setIcono("domain");
        notif.setEnlace("/menu-principal/PanelAdmi/ValidarEmpresa");

        Map<String, Object> datosNotif = new java.util.HashMap<>();
        datosNotif.put("cantidad", cantidadPendientes);
        notif.setDatos(datosNotif);
        notif.setLeida(false);

        Notificacion guardada = notificacionRepo.save(notif);

        // Push por WebSocket
        try {
            NotificacionDTO dto = mapearADTO(guardada);
            messagingTemplate.convertAndSend("/topic/notificaciones/" + idUsuario, dto);
        } catch (Exception e) {
            System.err.println("Error enviando WebSocket de empresas pendientes: " + e.getMessage());
        }
    }
}