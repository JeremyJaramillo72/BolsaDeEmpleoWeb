package com.example.demo.service.Impl;

import ch.qos.logback.classic.Logger;
import com.example.demo.model.Usuario;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import com.example.demo.service.NotificacionService;
import com.example.demo.service.EmailService;
import jakarta.persistence.EntityManager; // 🔥 IMPORTANTE: Importar EntityManager
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class UsuarioServiceImpl implements IUsuarioService {

    private final UsuarioRepository usuarioRepository;

    // 🔥 NUEVO: Inyectamos el EntityManager para forzar la sincronización con PostgreSQL
    private final EntityManager entityManager;

    private final SeguridadDbRepository seguridadDbRepository;

    private final JdbcTemplate jdbcTemplate;

    private final PasswordEncoder passwordEncoder;

    private final NotificacionService notificacionService;

    private final EmailService emailService;


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


        entityManager.flush();
        entityManager.clear();

        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar usuario registrado."));


        entityManager.createNativeQuery("CALL seguridad.registroUsuarioLogin(:correo, :idUsuario, :idRol)")
                .setParameter("correo", usuarioGuardado.getCorreo())
                .setParameter("idUsuario", usuarioGuardado.getIdUsuario().intValue())
                .setParameter("idRol", idRolParaGuardar)
                .executeUpdate();

        try {

            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "in_app_registro_completado",
                    Map.of("usuarioNombre", usuarioGuardado.getNombre()),
                    Map.of(),
                    "/menu-principal/perfil-profesional",
                    "waving_hand"
            );


            notificacionService.crearYEnviarNotificacion(
                    usuarioGuardado.getIdUsuario(),
                    "email_registro_postulante",
                    Map.of(
                            "postulanteName", usuarioGuardado.getNombre(),
                            "correoPostulante", usuarioGuardado.getCorreo()
                    ),
                    Map.of(),
                    "/menu-principal/perfil-profesional",
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

        String contrasenaPlana = usuario.getContrasena();

        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());

        Integer idRol = usuario.getRol().getIdRol();

        try {
            if (idRol != 3 && idRol != 2) {

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

        entityManager.flush();
        entityManager.clear();

        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado tras registro."));

        try {
            usuarioRepository.crearCredencialesBD(
                    usuarioGuardado.getCorreo(),
                    usuarioGuardado.getIdUsuario().intValue(),
                    idRol
            );
            System.out.println("✅ Credenciales de BD creadas para: " + usuarioGuardado.getCorreo());


            if (idRol != 3 && idRol != 2) {
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        emailService.enviarCredencialesNuevoUsuario(
                                usuarioGuardado.getCorreo(),
                                usuarioGuardado.getNombre() != null ? usuarioGuardado.getNombre() : "Usuario",
                                contrasenaPlana // Enviamos la plana que guardamos al principio
                        );
                    } catch (Exception e) {
                        System.err.println("⚠️ Error enviando correo de credenciales en segundo plano: " + e.getMessage());
                    }
                });
            }

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

        entityManager.flush();
        entityManager.clear();

        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar empresa registrada."));

        enviarNotificacionesRegistro(usuarioGuardado, nombreEmp);
    }

    private void enviarNotificacionesRegistro(Usuario usuario, String nombreEmp) {
        //  enviar email de bienvenida a la empresa
        try {
            notificacionService.crearYEnviarNotificacion(
                    usuario.getIdUsuario(),
                    "email_registro_empresa",
                    Map.of("empresaNombre", nombreEmp, "correoEmpresa", usuario.getCorreo()),
                    Map.of(),
                    "/menu-principal/empresa/perfil",
                    "business"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Error en notificación de bienvenida a empresa: " + e.getMessage());
        }

        //  notificar al administrador de que hay una nueva empresa
        try {
            notificacionService.notificarAdminsDirecto(
                    "empresa_pendiente_aprobacion",
                    Map.of("nombreEmpresa", nombreEmp),
                    Map.of(),
                    "/menu-principal/PanelAdmi/ValidarEmpresa",
                    "admin_panel_settings"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Error notificando a admins sobre nueva empresa: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void cambiarEstadoUsuario(Long idUsuario, String nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstadoValidacion(nuevoEstado);
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        if ("activo".equalsIgnoreCase(nuevoEstado) || "aprobado".equalsIgnoreCase(nuevoEstado)) {
            try {
                System.out.println("Creando notificación de empresa aprobada para usuario: " + idUsuario);


                notificacionService.crearYEnviarNotificacion(
                        idUsuario,
                        "empresa_aprobada",
                        new java.util.HashMap<>(),
                        Map.of("idEmpresa", idUsuario),
                        "/menu-principal/gestion-ofertas",
                        "check_circle"
                );

            } catch (Exception e) {
                System.err.println("Error al crear notificación de empresa aprobada: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    // 🔥 NUEVO: Método para cambiar la contraseña
    @Override
    @Transactional
    public void cambiarContrasena(Long idUsuario, String claveActual, String nuevaClave) {
        try {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (!passwordEncoder.matches(claveActual, usuario.getContrasena())) {
                throw new RuntimeException("La contraseña actual es incorrecta.");
            }

            usuario.setContrasena(passwordEncoder.encode(nuevaClave));
            usuarioRepository.save(usuario);

            System.out.println("✅ Contraseña actualizada exitosamente para el usuario ID: " + idUsuario);

        } catch (Exception e) {
            System.err.println("❌ Error al cambiar la contraseña del usuario ID " + idUsuario + ": " + e.getMessage());

            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public List<UsuarioTablaDTO> obtenerUsuariosGenerales() {
        return usuarioRepository.obtenerUsuariosTablaNativa("{}");
    }
}