package com.example.demo.service.Impl;

import com.example.demo.model.Roles;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.RolesRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
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

    @Autowired
    private UsuarioEmpresaRepository empresaRepository;

    @Override
    @Transactional
    public void registrarUsuarioNormal(Usuario usuario) {
        // 1. Buscamos el objeto Rol (Postulante)
        Roles rolPostulante = rolesRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Error: El Rol de Postulante no existe."));

        // 2. Asignamos el objeto Rol completo al usuario
        usuario.setRol(rolPostulante);

        // 3. ¡AQUÍ USAS TU PROCEDIMIENTO ALMACENADO!
        usuarioRepository.registrarConProcedimiento(usuario);
    }

    @Override
    @Transactional // Crucial: si falla el guardado de la empresa, se deshace el usuario
    public void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc) {
        // 1. Buscamos el objeto Rol de Empresa (ID 2)
        Roles rolEmpresa = rolesRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Error: El Rol de Empresa (ID 2) no existe en la base de datos."));

        // 2. Asignamos el rol al usuario y lo guardamos primero
        usuario.setRol(rolEmpresa);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // 3. Creamos el objeto de la empresa y establecemos la relación 1:1
        UsuarioEmpresa empresa = new UsuarioEmpresa();

        // IMPORTANTE: Aquí usamos el objeto guardado para establecer la FK automáticamente
        empresa.setUsuario(usuarioGuardado);

        empresa.setNombreEmpresa(nombreEmp);
        empresa.setDescripcion(desc);
        empresa.setSitioWeb(web);
        empresa.setRuc(ruc);

        // 4. Guardamos en la tabla usuario_empresa
        empresaRepository.save(empresa);
    }
}