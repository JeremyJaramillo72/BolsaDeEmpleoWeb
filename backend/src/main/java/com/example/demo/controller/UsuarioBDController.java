package com.example.demo.controller;

import com.example.demo.dto.CambioClaveDTO;
import com.example.demo.model.Usuario;
import com.example.demo.repository.RolesRepository;
import com.example.demo.model.Roles;
import com.example.demo.service.EmailService;

import java.util.Collections;
import java.util.List;
import com.example.demo.repository.UsuarioImagenRepository;
import com.example.demo.repository.UsuarioRepository;
import java.util.Arrays;
import java.util.Map;
import com.example.demo.service.IUsuarioService;
import com.example.demo.service.Impl.UsuarioServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios-bd") // Ruta actualizada para mayor claridad
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UsuarioBDController {

    private final IUsuarioService usuarioService;
    private final RolesRepository rolesRepository;

    private final UsuarioRepository usuarioRepository;

    private final EmailService emailService;

    private final UsuarioImagenRepository usuarioImagenRepository;

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
        System.out.println("\n=== DEBUG: ROLES EN LA BD ===");
        for (Roles rol : roles) {
            System.out.println("ID: " + rol.getIdRol() + " | Nombre: '" + rol.getNombreRol() + "'");
        }
        System.out.println("=== FIN DEBUG ===\n");
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/listar-admins")
    public ResponseEntity<List<Usuario>> listarAdministrativos() {
        List<Usuario> admins = usuarioRepository.findByRol_IdRolNotIn(Arrays.asList(1, 2, 3));
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/debug-usuarios-por-rol")
    public ResponseEntity<?> debugUsuariosPorRol() {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("\n=== DEBUG: USUARIOS POR ROL ===\n");

            List<Roles> roles = rolesRepository.findAll();
            for (Roles rol : roles) {
                List<Usuario> usuarios = usuarioRepository.findByRol_NombreRol(rol.getNombreRol());
                sb.append("ROL: '").append(rol.getNombreRol()).append("' (ID: ").append(rol.getIdRol()).append(")\n");
                sb.append("  Usuarios encontrados: ").append(usuarios.size()).append("\n");
                for (Usuario u : usuarios) {
                    sb.append("    - ID: ").append(u.getIdUsuario()).append(" | Nombre: ").append(u.getNombre()).append("\n");
                }
            }
            sb.append("=== FIN DEBUG ===\n");

            String resultado = sb.toString();
            System.out.println(resultado);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            // 1. Cambiar estado en BD (dentro de transacción + guardar notificación)
            usuarioService.cambiarEstadoUsuario(id, estado);

            // 2. Enviar email FUERA de la transacción (si falla, el estado ya está guardado)
            if ("activo".equalsIgnoreCase(estado) || "aprobado".equalsIgnoreCase(estado)) {
                try {
                    Usuario usuario = usuarioRepository.findById(id)
                            .orElse(null);
                    if (usuario != null) {
                        emailService.notificarAprobacionEmpresa(usuario.getCorreo(), usuario.getNombre());
                    }
                } catch (Exception e) {
                    System.err.println("Error enviando email de aprobación: " + e.getMessage());
                    // No lanzar excepción, el estado ya está guardado en BD
                }
            }

            return ResponseEntity.ok("Estado actualizado a: " + estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ── Endpoint nuevo
    // Recibe el idEmpresa (que el frontend ya tiene en localStorage con
    // certeza como 'idEmpresa')
    @GetMapping("/empresa/{idEmpresa}/ultima-imagen")
    public ResponseEntity<?> getUltimaImagenEmpresa(@PathVariable Long idEmpresa) {
        try {
            String url = usuarioImagenRepository.findUltimaImagenUrlByEmpresa(idEmpresa);
            return ResponseEntity.ok(Map.of("urlImagen", url != null ? url : ""));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("urlImagen", ""));
        }
    }

    @PutMapping("/{id}/cambiar-clave")
    public ResponseEntity<?> cambiarClave(
            @PathVariable Long id,
            @RequestBody CambioClaveDTO dto) {
        try {
            usuarioService.cambiarContrasena(id, dto.getClaveActual(), dto.getNuevaClave());
            // Devolvemos un JSON con mensaje de éxito para que Angular lo lea fácil
            return ResponseEntity.ok(Collections.singletonMap("mensaje", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            // Si la clave es incorrecta, devolvemos un error 400
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}