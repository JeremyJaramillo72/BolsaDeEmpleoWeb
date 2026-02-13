package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.repository.RolesRepository;
import com.example.demo.model.Roles;
import java.util.List;
import com.example.demo.repository.UsuarioRepository;
import java.util.Arrays;
import com.example.demo.service.IUsuarioService;
import com.example.demo.service.Impl.UsuarioServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios-bd") // Ruta actualizada para mayor claridad
@CrossOrigin(origins = "*")
public class UsuarioBDController {

    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;


    @PostMapping("/registrar-completo")
    public ResponseEntity<?> registrarUsuarioConAcceso(@RequestBody Usuario usuario) {
        try {
            usuarioService.registrarUsuarioConAccesoBD(usuario);
            return new ResponseEntity<>("Usuario creado en el sistema y en PostgreSQL con éxito", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el proceso de registro: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // roles
    @GetMapping("/roles")
    public ResponseEntity<List<Roles>> listarRoles() {
        List<Roles> roles = rolesRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    // tablas de mini admis
    @GetMapping("/listar-admins")
    public ResponseEntity<List<Usuario>> listarAdministrativos() {
        // no muestro el o los admis globales por q luego se podría borrar el mismo
        List<Usuario> admins = usuarioRepository.findByRol_IdRolNotIn(Arrays.asList(1,2,3));
        return ResponseEntity.ok(admins);
    }

    @PutMapping("/cambiar-estado/{id}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {

            usuarioService.cambiarEstadoUsuario(id, estado);
            return ResponseEntity.ok("Estado actualizado a: " + estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}