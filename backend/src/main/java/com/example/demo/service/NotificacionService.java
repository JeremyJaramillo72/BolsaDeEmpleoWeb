package com.example.demo.service;

import com.example.demo.dto.IOfertaResumen;
import com.example.demo.dto.NotificacionDTO;
import com.example.demo.model.Notificacion;
import com.example.demo.model.PlantillaNotificacion;
import com.example.demo.model.Usuario;
import com.example.demo.repository.NotificacionRepository;
import com.example.demo.repository.OfertaLaboralRepository;
import com.example.demo.repository.PlantillaNotificacionRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.service.EmailService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    private final NotificacionRepository notificacionRepo;
    private final UsuarioRepository usuarioRepo;
    private final OfertaLaboralRepository ofertaRepo;
    private final PlantillaNotificacionRepository plantillaRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void crearYEnviarNotificacion(Long idUsuario, String tipo, Map<String, String> variables, Map<String, Object> datosJson, String enlace, String icono) {
        try {
            Usuario usuario = usuarioRepo.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 1. Generar Mensaje - Obtener plantilla desde BD
            PlantillaNotificacion plantilla = obtenerPlantillaConContenido(tipo);
            String mensajeFinal = plantilla.getContenido();
            String tituloFinal = plantilla.getTitulo();
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String llave = "{" + entry.getKey() + "}";
                mensajeFinal = mensajeFinal.replace(llave, entry.getValue());
                tituloFinal = tituloFinal.replace(llave, entry.getValue());
            }

            // si el tipo empieza con "email_", NO guardamos en la campanita
            if (!tipo.startsWith("email_")) {
                Notificacion notif = new Notificacion();
                notif.setUsuario(usuario);
                notif.setTitulo(tituloFinal);
                notif.setMensaje(mensajeFinal);
                notif.setTipo(tipo);
                notif.setIcono(icono != null ? icono : "bell");
                notif.setEnlace(enlace != null ? enlace : "");
                notif.setDatos(datosJson != null ? datosJson : new java.util.HashMap<>());
                notif.setLeida(false);

                Notificacion guardada = notificacionRepo.save(notif);

                try {
                    NotificacionDTO dto = mapearADTO(guardada);
                    messagingTemplate.convertAndSend("/topic/notificaciones/" + idUsuario, dto);
                } catch (Exception e) {
                    System.err.println("⚠️ Error enviando WebSocket: " + e.getMessage());
                }
            }

            // 5. Email condicional
            try {
                boolean enviarEmail = switch (tipo) {
                    case "postulacion_aprobada",
                         "proceso_entrevista",
                         "oferta_aprobada",
                         "empresa_aprobada",
                         "configuracion_correo_actualizada",
                         "email_registro_postulante",
                         "email_registro_empresa",
                         "email_correo_actualizado"
                  /*  , "email_postulacion_recibida" */
                            -> true;
                    default -> false;
                };

                if (enviarEmail) {
                    emailService.sendSimpleEmail(usuario.getCorreo(), tituloFinal, mensajeFinal);
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error enviando email a " + usuario.getCorreo() + ": " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("❌ Error en crearYEnviarNotificacion: " + e.getMessage());
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
            case "configuracion_correo_actualizada" -> "Alerta de Seguridad: Correo Actualizado";
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

                    PlantillaNotificacion plantilla =  obtenerPlantillaConContenido(tipo);
                    String tituloFinal = plantilla.getTitulo();
                    String mensajeFinal = plantilla.getContenido();
                    for (Map.Entry<String, String> entry : variables.entrySet()) {
                        String llave = "{" + entry.getKey() + "}";
                        tituloFinal = tituloFinal.replace(llave, entry.getValue());
                        mensajeFinal = mensajeFinal.replace(llave, entry.getValue());
                    }

                    notif.setTitulo(tituloFinal);
                    notif.setMensaje(mensajeFinal);
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
                    PlantillaNotificacion platilla = obtenerPlantillaConContenido(tipo);
                    String tituloFinal = platilla.getTitulo();
                    String mensajeFinal = platilla.getContenido();
                    for (Map.Entry<String, String> entry : variables.entrySet()) {
                        String llave = "{" + entry.getKey() + "}";
                        mensajeFinal = mensajeFinal.replace(llave, entry.getValue());
                        tituloFinal = tituloFinal.replace(llave, entry.getValue());
                    }

                    Notificacion notif = new Notificacion();
                    notif.setUsuario(u);
                    notif.setTitulo(tituloFinal);
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

    @Transactional(readOnly = true)
    public List<NotificacionDTO> obtenerNotificacionesActivas(Long idUsuario) {
        // PANEL (Bell icon): SOLO notificaciones NO LEÍDAS de los últimos 5 días
        List<NotificacionDTO> notificacionesDB = notificacionRepo.findNotificacionesActivas(idUsuario)
                .stream()
                .filter(n -> !n.getLeida()) // ← SOLO NO LEÍDAS
                .map(this::mapearADTO)
                .collect(Collectors.toList());

        // Agregar notificaciones virtuales de "última oportunidad" (también no leídas)
        try {
            List<NotificacionDTO> notificacionesVirtuales = generarNotificacionesUltimaOportunidad(idUsuario);
            notificacionesDB.addAll(notificacionesVirtuales);
        } catch (Exception e) {
            System.err.println("⚠️ Error generando notificaciones de última oportunidad: " + e.getMessage());
        }

        return notificacionesDB;
    }

    /**
     * Genera notificaciones virtuales para ofertas que cierran en menos de 24 horas
     * y a las que el usuario ya ha postulado.
     * Estas notificaciones NO se guardan en BD, solo se generan dinámicamente.
     */
    @Transactional(readOnly = true)
    protected List<NotificacionDTO> generarNotificacionesUltimaOportunidad(Long idUsuario) {
        List<NotificacionDTO> notificacionesVirtuales = new java.util.ArrayList<>();

        try {
            Usuario usuario = usuarioRepo.findById(idUsuario).orElse(null);
            if (usuario == null) return notificacionesVirtuales;

            // Solo para postulantes
            if (usuario.getRol() == null || !usuario.getRol().getNombreRol().equals("Postulante")) {
                return notificacionesVirtuales;
            }

            // Obtener ofertas aprobadas que cierran en máximo 24 horas Y a las que el usuario no ha postulado
            LocalDate hoy = LocalDate.now();
            LocalDate mañana = hoy.plusDays(1);
            LocalDateTime ahora = LocalDateTime.now();

            List<IOfertaResumen> ofertasAprobadas = ofertaRepo.obtenerOfertasSinPostularCerrandoProximamente(idUsuario);

            for (IOfertaResumen oferta : ofertasAprobadas) {
                if (oferta.getFechaCierre() == null) continue;

                LocalDate fechaCierre = oferta.getFechaCierre();
                LocalDateTime fechaCierreDT = fechaCierre.atTime(23, 59, 59);

                // Solo si cierra en máximo 24 horas y aún no ha pasado
                if ((fechaCierre.isEqual(hoy) || fechaCierre.isEqual(mañana)) &&
                    fechaCierreDT.isAfter(ahora)) {

                    long horasRestantes = ChronoUnit.HOURS.between(ahora, fechaCierreDT);
                    String tiempoRestante;
                    if (horasRestantes > 24) {
                        tiempoRestante = "1 día";
                    } else if (horasRestantes > 1) {
                        tiempoRestante = horasRestantes + " horas";
                    } else if (horasRestantes == 1) {
                        tiempoRestante = "1 hora";
                    } else {
                        long minutosRestantes = ChronoUnit.MINUTES.between(ahora, fechaCierreDT);
                        tiempoRestante = minutosRestantes + " minutos";
                    }

                    NotificacionDTO notifVirtual = new NotificacionDTO();
                    notifVirtual.setIdNotificacion(-1 * oferta.getIdOferta().intValue());
                    notifVirtual.setTitulo("Última oportunidad: " + oferta.getTitulo());
                    notifVirtual.setMensaje("La oferta cierra en " + tiempoRestante + ". ¡No te la pierdas!");
                    notifVirtual.setTipo("ultima_oportunidad");
                    notifVirtual.setIcono("alarm_on");
                    notifVirtual.setEnlace("/menu-principal/Busqueda/empleo");
                    notifVirtual.setLeida(false);
                    notifVirtual.setFechaCreacion(ahora);
                    notifVirtual.setDatos(Map.of("idOferta", oferta.getIdOferta(), "tiempoRestante", tiempoRestante));

                    notificacionesVirtuales.add(notifVirtual);
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error en generarNotificacionesUltimaOportunidad: " + e.getMessage());
        }

        return notificacionesVirtuales;
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

    /**
     * Obtiene el contenido de una plantilla desde la BD.
     * Si existe en BD, devuelve el contenido de la plantilla.
     * Si no existe, devuelve un fallback genérico (sin hardcoding por tipo).
     */

    private PlantillaNotificacion obtenerPlantillaConContenido(String tipo) {
        try {
            var plantilla = plantillaRepo.findByTipoAndActivo(tipo, true);
            if (plantilla.isPresent()) {
                return plantilla.get();  // ✅ Devuelve la plantilla completa con Título y Contenido
            }
        } catch (Exception e) {
            log.error("❌ Error consultando plantilla de BD para tipo '{}': {}", tipo, e.getMessage());
        }

        // Fallback genérico si no existe en BD
        log.warn("⚠️ Plantilla '{}' no encontrada en BD. Usando fallback genérico.", tipo);
        PlantillaNotificacion fallback = new PlantillaNotificacion();
        fallback.setTitulo(generarTituloPorTipo(tipo)); // Usamos tu switch antiguo como salvavidas
        fallback.setContenido("Tienes una nueva notificación: " + tipo);
        return fallback;
    }
}