package com.example.demo.service.Impl; // Paquete en minúsculas por estándar

import com.example.demo.model.Roles;
import com.example.demo.model.Usuario;
import com.example.demo.repository.RolesRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolesRepository rolesRepository;

    @Override
    @Transactional
    public void registrarUsuarioNormal(Usuario usuario) {
        // 1. Buscamos el objeto Rol (Postulante ID 3)
        Roles rolPostulante = rolesRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Error: El Rol de Postulante no existe."));

        // 2. Asignamos el objeto Rol al usuario para que el Repositorio lo lea
        usuario.setRol(rolPostulante);

        // 3. Ejecutamos el procedimiento de postulantes
        usuarioRepository.registrarConProcedimiento(usuario);
    }

    @Override
    @Transactional
    public void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc) {
        // En este método ya no necesitamos buscar el Rol ID 2 en Java,
        // porque nuestro procedimiento 'sp_registrar_empresa_completa' lo asigna automáticamente.

        // Extraemos el ID de la ciudad para pasarlo al procedimiento
        Integer idCiudad = null;
        if (usuario.getCiudad() != null) {
            idCiudad = usuario.getCiudad().getIdCiudad();
        }

        // LLAMADA AL NUEVO MÉTODO DEL REPOSITORIO
        usuarioRepository.registrarEmpresaPro(
                usuario.getCorreo(),
                usuario.getContrasena(), // Ya viene encriptada desde el controlador
                idCiudad,
                nombreEmp,
                desc,
                ruc,
                web
        );
    }
}