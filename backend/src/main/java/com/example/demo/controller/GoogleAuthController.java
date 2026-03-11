package com.example.demo.controller;

import com.example.demo.dto.GoogleTokenDto;
import com.example.demo.service.GoogleAuthService;
import com.example.demo.service.JwtService;
import com.example.demo.service.UsuarioServiceGoogle;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/email")
@CrossOrigin(origins = "*")
public class GoogleAuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private UsuarioServiceGoogle usuarioService;

    @Autowired
    private JwtService jwtService; // 🔥 Inyectamos el nuevo servicio de JWT

    @PostMapping("/google")
    public ResponseEntity<?> loginConGoogle(@RequestBody GoogleTokenDto tokenDto) {
        try {
            GoogleIdToken.Payload payload = googleAuthService.verificarToken(tokenDto.getToken());
            String email = payload.getEmail();

            // 1. Registro/Login en BD (Ya lo teníamos listo con tus procedures)
            boolean yaExiste = usuarioService.existePorCorreo(email);
            Long idUsuario = null;
            if (!yaExiste) {
                // 🔥 CAPTURAR EL ID DEL USUARIO CREADO
                idUsuario = usuarioService.registrarUsuarioCompletoGoogle(
                        (String) payload.get("given_name"),
                        (String) payload.get("family_name"),
                        email,
                        (String) payload.get("picture")
                );
            } else {
                // Si ya existe, obtener su ID
                idUsuario = usuarioService.obtenerIdPorCorreo(email);
            }

            // 2. 🔥 GENERAMOS NUESTRO PROPIO JWT DEL SISTEMA
            // Aquí le damos el "pase VIP" de nuestra app
            String tokenSistema = jwtService.generarToken(email, "POSTULANTE");

            // 3. Respuesta final
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("token_sistema", tokenSistema); // 💎 ¡Aquí va la joya!

            Map<String, Object> user = new HashMap<>();
            user.put("email", email);
            user.put("nombre", (String) payload.get("given_name"));
            user.put("foto", (String) payload.get("picture"));
            user.put("idUsuario", idUsuario); // 🔥 INCLUIR EL ID DEL USUARIO
            user.put("rol", "POSTULANTE");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}