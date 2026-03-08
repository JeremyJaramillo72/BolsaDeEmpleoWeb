package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.repository.RolesRepository;
import com.example.demo.model.Roles;
import java.util.List;
import com.example.demo.repository.UsuarioImagenRepository;
import com.example.demo.repository.UsuarioRepository;
import java.util.Arrays;
import java.util.Map;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios-bd")
@CrossOrigin(origins = "*")
public class UsuarioBDController {

    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioImagenRepository usuarioImagenRepository;

    // ── Endpoints existentes — sin modificar ─────────────────────────────

    @PostMapping("/registrar-completo")
    public ResponseEntity<?> registrarUsuarioConAcceso(@RequestBody Usuario usuario) {
        try {
            usuarioService.registrarUsuarioConAccesoBD(usuario);
            return new ResponseEntity<>("Usuario creado en el sistema y en PostgreSQL con éxito", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el proceso de registro: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Roles>> listarRoles() {
        List<Roles> roles = rolesRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/listar-admins")
    public ResponseEntity<List<Usuario>> listarAdministrativos() {
        List<Usuario> admins = usuarioRepository.findByRol_IdRolNotIn(Arrays.asList(1, 2, 3));
        return ResponseEntity.ok(admins);
    }

    @PutMapping("/cambiar-estado/{id}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            usuarioService.cambiarEstadoUsuario(id, estado);
            return ResponseEntity.ok("Estado actualizado a: " + estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ── Endpoint nuevo ────────────────────────────────────────────────────
    // GET /api/usuarios-bd/empresa/{idEmpresa}/ultima-imagen
    //
    // Recibe el idEmpresa (que el frontend YA tiene en localStorage con
    // certeza como 'idEmpresa') y devuelve la URL de la última imagen
    // personalizada subida por el usuario propietario de esa empresa.
    //
    // Respuesta:
    //   { "urlImagen": "https://res.cloudinary.com/..." }  ← tiene imagen
    //   { "urlImagen": "" }                                 ← sin imagen válida
    @GetMapping("/empresa/{idEmpresa}/ultima-imagen")
    public ResponseEntity<?> getUltimaImagenEmpresa(@PathVariable Long idEmpresa) {
        try {
            String url = usuarioImagenRepository.findUltimaImagenUrlByEmpresa(idEmpresa);
            return ResponseEntity.ok(Map.of("urlImagen", url != null ? url : ""));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("urlImagen", ""));
        }
    }
}