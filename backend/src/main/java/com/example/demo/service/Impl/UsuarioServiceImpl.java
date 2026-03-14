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

        try {
            if (usuario.getPermisosUi() != null && !usuario.getPermisosUi().isEmpty()) {


                usuarioRepository.registrarAdminInternoPro(
                        usuario.getNombre(),
                        usuario.getApellido(),
                        contrasenaEncriptada,
                        usuario.getCorreo(),
                        usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                        usuario.getGenero(),
                        usuario.getTelefono(),
                        usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                        usuario.getRol().getIdRol(),
                        usuario.getPermisosUi()
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
                        usuario.getRol().getIdRol()
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
                    usuario.getRol().getIdRol()
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


        jdbcTemplate.update("CALL seguridad.registroUsuarioLogin(?, ?, ?)",
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getIdUsuario().intValue(),
                2 // ID del rol Empresa
        );

        // Notificar a admins sobre nueva empresa registrada
        try {
            Map<String, String> variables = new java.util.HashMap<>();
            variables.put("nombreEmpresa", nombreEmp);

            Map<String, Object> datos = new java.util.HashMap<>();
            datos.put("idUsuarioEmpresa", usuarioGuardado.getIdUsuario());
            datos.put("nombreEmpresa", nombreEmp);

            notificacionService.notificarAdminsDirecto(
                    "empresa_pendiente_aprobacion",
                    variables,
                    datos,
                    "/menu-principal/PanelAdmi/AprobacionEmpresas",
                    "domain"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Warning - Notificación empresa no guardada: " + e.getMessage());
        }

        try {
            // 1. Notificación en Campanita (In-App)
            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "in_app_registro_completado",
                    Map.of("usuarioNombre", nombreEmp),
                    Map.of(),
                    "/menu-principal/perfil",
                    "waving_hand"
            );

            // 2. Notificación por Correo
            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "email_registro_empresa",
                    Map.of(
                            "empresaNombre", nombreEmp,
                            "correoEmpresa", usuarioGuardado.getCorreo()
                    ),
                    Map.of(),
                    "/menu-principal",
                    "email"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar notificaciones de bienvenida a empresa: " + e.getMessage());
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
            } catch (Exception e) {
                System.err.println("❌ Error al crear notificación de empresa aprobada: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
