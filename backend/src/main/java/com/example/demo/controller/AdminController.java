package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.model.Ciudad;
import com.example.demo.repository.CiudadRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.Views.IEmpresaResumenProjection;
import com.example.demo.service.IUsuarioService;
import com.example.demo.service.EmailService; // asegurate de tener este import
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor // le dice a lombok que inyecte todo lo que sea "private final"
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final IUsuarioService usuarioService;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final CiudadRepository ciudadRepository;
    private final EmailService emailService;


    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/crear")
    public ResponseEntity<?> registrarAdmin(@RequestBody Map<String, Object> payload) {
        try {
            Usuario admin = new Usuario();
            admin.setNombre((String) payload.get("Nombre"));
            admin.setApellido((String) payload.get("Apellido"));
            admin.setCorreo((String) payload.get("Correo"));
            admin.setTelefono((String) payload.get("Telefono"));

            String passRaw = (String) payload.get("Contrasena");
            if (passRaw != null) {
                admin.setContrasena(encoder.encode(passRaw));
            }

            if (payload.get("idCiudad") != null) {
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("la ciudad con id " + idCiudad + " no existe."));

                admin.setCiudad(ciudad);
            }

            usuarioService.registrarAdministrador(admin);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "administrador registrado con éxito"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "error al registrar admin: " + e.getMessage()));
        }
    }

    @GetMapping("/empresas")
    public ResponseEntity<List<IEmpresaResumenProjection>> listarEmpresas(@RequestParam(required = false) String estado) {
        if (estado == null || estado.equals("Todas") || estado.isEmpty()) {
            return ResponseEntity.ok(usuarioEmpresaRepository.listarDesdeVista());
        } else {
            String estadoBD = estado.endsWith("s") ? estado.substring(0, estado.length() - 1) : estado;
            return ResponseEntity.ok(usuarioEmpresaRepository.listarDesdeVistaPorEstado(estadoBD));
        }
    }

    @PutMapping("/validar-empresa/{idUsuario}")
    public ResponseEntity<?> cambiarEstadoEmpresa(@PathVariable Long idUsuario, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("nuevoEstado");

            return usuarioRepository.findById(idUsuario).map(usuario -> {

                // 1. cambiamos el estado y guardamos
                usuario.setEstadoValidacion(nuevoEstado);
                usuarioRepository.save(usuario);

                // 2. enviamos el correo electrónico
                try {
                    emailService.enviarCorreoValidacion(usuario.getCorreo(), usuario.getNombre(), nuevoEstado);
                } catch (Exception e) {
                    System.out.println("no se pudo enviar el correo: " + e.getMessage());
                }

                return ResponseEntity.ok(Map.of("mensaje", "empresa " + nuevoEstado + " correctamente."));
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "usuario no encontrado")));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "error del servidor: " + e.getMessage()));
        }
    }
}