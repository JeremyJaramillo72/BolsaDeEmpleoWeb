package com.example.demo.service.Impl;

import com.example.demo.model.SeguridadDb;
import com.example.demo.model.Usuario;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDateTime;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SeguridadDbRepository seguridadDbRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Clave única acordada con el ingeniero
    private static final String CLAVE_UNICA_BD = "Uteq_2026_Secure";

    @Override
    @Transactional
    public void registrarUsuarioNormal(Usuario usuario) {
        usuarioRepository.registrarPostulantePro(
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getContrasena(),
                usuario.getCorreo(),
                usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                usuario.getGenero(),
                usuario.getTelefono(),
                usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                3
        );
        // 2. BUSCAMOS EL ID GENERADO (Vital para el SP de seguridad)
        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error al recuperar usuario registrado."));

        // 3. CREAMOS EL USUARIO DE BASE DE DATOS AUTOMÁTICAMENTE
        // Llamamos a tu SP: registroUsuarioLogin(correo, id, rol)
        jdbcTemplate.update("CALL public.registroUsuarioLogin(?, ?, ?)",
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getIdUsuario().intValue(),
                3 // ID del rol Postulante
        );
    }

    @Override
    @Transactional
    public void registrarUsuarioConAccesoBD(Usuario usuario) {
        // 1. Ejecutamos tu SP de registro de postulante (el que ya tenías)
        registrarUsuarioNormal(usuario);

        // 2. Buscamos el usuario para obtener el ID generado por la BD
        Usuario usuarioGuardado = usuarioRepository.findByCorreo(usuario.getCorreo())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado tras registro."));

        try {
            // 3. Llamamos a tu NUEVO procedimiento: registroUsuarioLogin
            // Parámetros: Correo (text), id_usuario (int), id_rol (int)
            String sqlCallSP = "CALL public.registroUsuarioLogin(?, ?, ?)";

            jdbcTemplate.update(sqlCallSP,
                    usuarioGuardado.getCorreo(),
                    usuarioGuardado.getIdUsuario().intValue(), // Convertimos Long a int
                    usuarioGuardado.getRol().getIdRol()         // Enviamos el ID del rol (1, 2 o 3)
            );

        } catch (Exception e) {
            // Si el usuario ya existe en Postgres, el SP fallará y @Transactional hará rollback
            throw new RuntimeException("Error al crear credenciales de BD: " + e.getMessage());
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
