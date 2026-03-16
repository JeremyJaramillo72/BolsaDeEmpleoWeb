package com.example.demo.service.Impl;

import com.example.demo.model.Usuario;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import com.example.demo.service.NotificacionService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.UsuarioTablaDTO;

import java.sql.Date;
import java.util.List;
import java.util.Map;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SeguridadDbRepository seguridadDbRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private EmailService emailService;

    // Clave única acordada con el ingeniero
    private static final String CLAVE_UNICA_BD = "Uteq_2026_Secure";

    @Override
    @Transactional
    public void registrarUsuarioNormal(Usuario usuario) {
        int idRolParaGuardar = (usuario.getRol() != null && usuario.getRol().getIdRol() != null)
                ? usuario.getRol().getIdRol()
                : 3;

        usuarioRepository.registrarPostulantePro(
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getContrasena(),
                usuario.getCorreo(),
                usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                usuario.getGenero(),
                usuario.getTelefono(),
                usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                idRolParaGuardar
        );

        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar usuario registrado."));


        jdbcTemplate.update("CALL seguridad.registroUsuarioLogin(?, ?, ?)",
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getIdUsuario().intValue(),
                idRolParaGuardar// ID del rol Postulante
        );
        try {
            // 1. Notificación en Campanita (In-App)
            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "in_app_registro_completado",
                    Map.of("usuarioNombre", usuarioGuardado.getNombre()),
                    Map.of(),
                    "/menu-principal/perfil", // de una al cv
                    "waving_hand"
            );

            // 2. Notificación por Correo
            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "email_registro_postulante",
                    Map.of(
                            "postulanteName", usuarioGuardado.getNombre(),
                            "correoPostulante", usuarioGuardado.getCorreo()
                    ),
                    Map.of(),
                    "/menu-principal",
                    "email"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar notificaciones de bienvenida a postulante: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void registrarAdministrador(Usuario admin) {

        Integer idCiudad = (admin.getCiudad() != null) ? admin.getCiudad().getIdCiudad() : null;

        usuarioRepository.registrarAdminPro(
                admin.getNombre(),
                admin.getApellido(),
                admin.getContrasena(),
                admin.getCorreo(),
                admin.getTelefono(),
                idCiudad
        );
    }

    @Override
    @Transactional
    public void registrarUsuarioConAccesoBD(Usuario usuario) {

        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());

        // Obtenemos el ID del rol para la validación
        Integer idRol = usuario.getRol().getIdRol();

        try {
            // Asumiendo que 3 es Postulante y 2 es Empresa.
            // Si no es 3 ni 2, entonces es un Admin Interno.
            if (idRol != 3 && idRol != 2) {

                // ¡ACTUALIZADO! Ya no enviamos usuario.getPermisosUi() al final
                usuarioRepository.registrarAdminInternoPro(
                        usuario.getNombre(),
                        usuario.getApellido(),
                        contrasenaEncriptada,
                        usuario.getCorreo(),
                        usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                        usuario.getGenero(),
                        usuario.getTelefono(),
                        usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                        idRol
                );

            } else {

                usuarioRepository.registrarPostulantePro(
                        usuario.getNombre(),
                        usuario.getApellido(),
                        contrasenaEncriptada,
                        usuario.getCorreo(),
                        usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                        usuario.getGenero(),
                        usuario.getTelefono(),
                        usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                        idRol
                );
            }
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("El correo " + usuario.getCorreo() + " ya está registrado.");
        }

        // 3. RECUPERAR ID Y CREAR LOGIN
        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado tras registro."));

        try {
            usuarioRepository.crearCredencialesBD(
                    usuarioGuardado.getCorreo(),
                    usuarioGuardado.getIdUsuario().intValue(),
                    idRol
            );
            System.out.println("✅ Credenciales de BD creadas para: " + usuarioGuardado.getCorreo());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creando credenciales Login: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc) {

        usuarioRepository.registrarEmpresaPro(
                usuario.getCorreo(),
                usuario.getContrasena(),
                usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                nombreEmp,
                desc,
                ruc,
                web
        );


        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar empresa registrada."));

        enviarNotificacionesRegistro(usuarioGuardado, nombreEmp);
    }


    private void enviarNotificacionesRegistro(Usuario usuario, String nombreEmp) {
        try {
            // 1. Email de bienvenida a la empresa
            try {
                String asuntoEmail = "Bienvenida a Bolsa de Empleo - " + nombreEmp;
                String cuerpoEmail = "¡Bienvenida a Bolsa de Empleo UTEQ!\n\n" +
                                   "Hemos recibido tu solicitud de registro para la empresa: " + nombreEmp + "\n\n" +
                                   "Tu cuenta ha sido creada y está actualmente en estado de revisión.\n" +
                                   "Nuestros administradores evaluarán tu información y te notificarán cuando sea aprobada.\n\n" +
                                   "Mientras tanto, puedes explorar la plataforma y preparar tus ofertas de empleo.\n\n" +
                                   "¿Preguntas? Contacta nuestro equipo de soporte.";
                emailService.sendSimpleEmail(usuario.getCorreo(), asuntoEmail, cuerpoEmail);
            } catch (Exception e) {
                System.err.println("⚠️ Error enviando email de bienvenida a empresa: " + e.getMessage());
            }

            // 2. Notificación en App
            try {
                notificacionService.crearYEnviarNotificacion(
                        usuario.getIdUsuario(),
                        "in_app_registro_completado",
                        Map.of("empresaNombre", nombreEmp),
                        Map.of(),
                        "/menu-principal/perfil",
                        "business"
                );
            } catch (Exception e) {
                System.err.println("⚠️ Error enviando notificación en app de registro de empresa: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("⚠️ Error en notificaciones: " + e.getMessage());
        }
    }
    @Override
    @Transactional
    public void cambiarEstadoUsuario(Long idUsuario, String nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstadoValidacion(nuevoEstado);
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        // Si la empresa fue aprobada, crear notificación
        if ("activo".equalsIgnoreCase(nuevoEstado) || "aprobado".equalsIgnoreCase(nuevoEstado)) {
            try {
                Map<String, String> variables = new java.util.HashMap<>();

                Map<String, Object> datos = new java.util.HashMap<>();
                datos.put("idEmpresa", usuarioActualizado.getIdUsuario());

                String enlace = "/menu-principal/gestion-ofertas";

                System.out.println("✅ Creando notificación de empresa aprobada para usuario: " + idUsuario);
                notificacionService.crearYEnviarNotificacion(
                        idUsuario,
                        "empresa_aprobada",
                        variables,
                        datos,
                        enlace,
                        "check_circle"
                );

                // Email de aprobación a la empresa
                try {
                    emailService.notificarAprobacionEmpresa(
                            usuarioActualizado.getCorreo(),
                            usuarioActualizado.getNombre()
                    );
                } catch (Exception e) {
                    System.err.println("⚠️ Error enviando email de aprobación a empresa: " + e.getMessage());
                }

            } catch (Exception e) {
                System.err.println("❌ Error al crear notificación de empresa aprobada: " + e.getMessage());
                e.printStackTrace();
            }
        }


    }

    @Override
    public List<UsuarioTablaDTO> obtenerUsuariosGenerales() {
        // Le pasamos un JSON vacío a la función de PostgreSQL para que traiga TODOS los usuarios
        return usuarioRepository.obtenerUsuariosTablaNativa("{}");
    }
}
