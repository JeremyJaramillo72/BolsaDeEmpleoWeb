package com.example.demo.service.Impl;

import com.example.demo.model.Usuario;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;

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
        // 2. BUSCAMOS EL ID GENERADO (Vital para el SP de seguridad)
        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar usuario registrado."));

        // 3. CREAMOS EL USUARIO DE BASE DE DATOS AUTOMÁTICAMENTE
        // Llamamos a tu SP: registroUsuarioLogin(correo, id, rol)
        jdbcTemplate.update("CALL public.registroUsuarioLogin(?, ?, ?)",
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getIdUsuario().intValue(),
                idRolParaGuardar// ID del rol Postulante
        );
    }

    @Override
    @Transactional
    public void registrarAdministrador(Usuario admin) {
        // Cambiamos Long por Integer para que coincida con tu Entidad Ciudad
        Integer idCiudad = (admin.getCiudad() != null) ? admin.getCiudad().getIdCiudad() : null;

        usuarioRepository.registrarAdminPro(
                admin.getNombre(),
                admin.getApellido(),
                admin.getContrasena(),
                admin.getCorreo(),
                admin.getTelefono(),
                idCiudad // Ahora coincide con el Integer del Repo
        );
    }

    @Override
    @Transactional
    public void registrarUsuarioConAccesoBD(Usuario usuario) {


        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());

        try {
            if (usuario.getPermisosUi() != null && !usuario.getPermisosUi().isEmpty()) {

                // --- CAMINO PARA ADMINISTRADORES / INTERNOS ---
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
                // --- CAMINO PARA USUARIOS NORMALES ---
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

        // 2. Buscamos el ID
        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar empresa registrada."));

        // 3. CREAMOS EL USUARIO DE BASE DE DATOS (Rol 2 para empresas)
        jdbcTemplate.update("CALL public.registroUsuarioLogin(?, ?, ?)",
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getIdUsuario().intValue(),
                2 // ID del rol Empresa
        );
    }
}
