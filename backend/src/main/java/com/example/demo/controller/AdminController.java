package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.model.Ciudad;
import com.example.demo.repository.CiudadRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.Views.IEmpresaResumenProjection;
import com.example.demo.service.IUsuarioService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")

public class AdminController {
    @Autowired
private UsuarioRepository usuarioRepository;

    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private UsuarioEmpresaRepository usuarioEmpresaRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Autowired
    private CiudadRepository ciudadRepository;


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
                // 1. Convertimos a Integer (que es lo que pide tu repositorio)
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("La Ciudad con ID " + idCiudad + " no existe."));

                admin.setCiudad(ciudad);
            }


            usuarioService.registrarAdministrador(admin);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Administrador registrado con éxito"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar admin: " + e.getMessage()));
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
    // 2. Agrega el método que Angular está intentando llamar al hacer click en los botones
    @PutMapping("/validar-empresa/{idUsuario}")
    public ResponseEntity<?> cambiarEstadoEmpresa(@PathVariable Long idUsuario, @RequestBody Map<String, String> body) {
        try {

            String nuevoEstado = body.get("nuevoEstado");

            return usuarioRepository.findById(idUsuario).map(usuario -> {

                usuario.setEstadoValidacion(nuevoEstado);


                usuarioRepository.save(usuario);

                return ResponseEntity.ok(Map.of("mensaje", "Empresa " + nuevoEstado + " correctamente."));
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuario no encontrado")));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error del servidor: " + e.getMessage()));
        }
    }
}