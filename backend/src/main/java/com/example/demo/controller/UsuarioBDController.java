package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.repository.RolesRepository;
import com.example.demo.model.Roles;
import java.util.List;
import com.example.demo.service.IUsuarioService;
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



    @PostMapping("/registrar-completo")
    public ResponseEntity<?> registrarUsuarioConAcceso(@RequestBody Usuario usuario) {
        try {
            usuarioService.registrarUsuarioConAccesoBD(usuario);
            return new ResponseEntity<>("Usuario creado en el sistema y en PostgreSQL con éxito", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el proceso de registro: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // 1. NUEVO ENDPOINT: Traer roles de la BD
    @GetMapping("/roles")
    public ResponseEntity<List<Roles>> listarRoles() {
        List<Roles> roles = rolesRepository.findAll();
        return ResponseEntity.ok(roles);
    }
}