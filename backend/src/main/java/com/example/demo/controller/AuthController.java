package com.example.demo.controller;

import com.example.demo.dto.LoginRequest; //
import com.example.demo.repository.UsuarioRepository; //
import com.example.demo.service.AuthService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // Permite la conexión desde Angular
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UsuarioRepository usuarioRepository; //

    @Autowired
    private PasswordEncoder passwordEncoder; //

    // --- LÓGICA DE REGISTRO (EXISTENTE) ---
    @PostMapping("/enviar-codigo")
    public ResponseEntity<?> solicitarCodigo(@RequestBody Map<String, String> request) {
        String correo = request.get("Correo");

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo es obligatorio"));
        }

        try {
            // 1. Generar código aleatorio de 6 dígitos
            String codigo = String.format("%06d", new Random().nextInt(1000000));

            // 2. Guardar en la memoria temporal (AuthService)
            authService.guardarCodigo(correo, codigo);

            // 3. Enviar por email usando el servicio
            emailService.enviarCodigo(correo, codigo);

            return ResponseEntity.ok(Map.of("mensaje", "Código enviado con éxito a " + correo));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No se pudo enviar el correo. Revisa la configuración del servidor."));
        }
    }

    // --- LÓGICA DE LOGIN (NUEVA) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) { //
        // 1. Buscar el usuario por correo electrónico
        return usuarioRepository.findByCorreo(request.getCorreo())
                .map(usuario -> {
                    // 2. Comparar la contraseña ingresada con el hash de la BD
                    if (passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {

                        // 3. Devolver datos necesarios para la sesión en Angular
                        Map<String, Object> response = new HashMap<>();
                        response.put("mensaje", "¡Bienvenido de nuevo!");
                        response.put("idUsuario", usuario.getIdUsuario());
                        response.put("rol", usuario.getRol()); // 'CANDIDATO' o 'EMPRESA'
                        response.put("nombre", usuario.getNombre());

                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Collections.singletonMap("error", "Contraseña incorrecta"));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "El usuario no existe")));
    }
}