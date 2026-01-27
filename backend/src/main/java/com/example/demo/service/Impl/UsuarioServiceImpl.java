package com.example.demo.service.Impl;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Date;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional // Mantenemos la transacción para asegurar la integridad de los datos
    public void registrarUsuarioNormal(Usuario usuario) {
        // Mapeo exacto para sp_registrar_postulante
        usuarioRepository.registrarPostulantePro(
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getContrasena(),
                usuario.getCorreo(),
                usuario.getFechaNacimiento() != null ? Date.valueOf(usuario.getFechaNacimiento()) : null,
                usuario.getGenero(),
                usuario.getTelefono(),
                usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                3 // Rol de Postulante
        );
    }

    @Override
    @Transactional
    public void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc) {
        // ACTUALIZACIÓN: Ahora incluimos nombre y apellido del objeto usuario
        // para cumplir con las restricciones NOT NULL de la tabla 'usuario'
        usuarioRepository.registrarEmpresaPro(
                usuario.getCorreo(),
                usuario.getContrasena(),
                usuario.getCiudad() != null ? usuario.getCiudad().getIdCiudad() : null,
                nombreEmp,   // Representante o nombre empresa
                desc,
                ruc,
                web
        );
    }
}