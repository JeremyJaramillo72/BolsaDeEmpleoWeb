package com.example.demo.controller;

import com.example.demo.dto.GoogleTokenDto;
import com.example.demo.model.Seguridad;
import com.example.demo.model.Usuario;
import com.example.demo.repository.SeguridadRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/email")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final  GoogleAuthService googleAuthService;

    private final UsuarioServiceGoogle usuarioService;

    private final JwtService jwtService; // 🔥 Inyectamos el nuevo servicio de JWT

    // 👇 INYECCIONES AÑADIDAS PARA EL SWITCH DE BASE DE DATOS 👇
    private final UsuarioRepository usuarioRepository;

    private final SeguridadRepository seguridadRepository;

    private final DbSwitchService dbSwitchService;

    private final ISesionService sesionService;

    @PostMapping("/google")
    public ResponseEntity<?> loginConGoogle(@RequestBody GoogleTokenDto tokenDto, HttpServletRequest request) {
        try {
            GoogleIdToken.Payload payload = googleAuthService.verificarToken(tokenDto.getToken());
            String email = payload.getEmail();

            // 1. Registro/Login en BD
            boolean yaExiste = usuarioService.existePorCorreo(email);
            Long idUsuario = null;
            if (!yaExiste) {
                idUsuario = usuarioService.registrarUsuarioCompletoGoogle(
                        (String) payload.get("given_name"),
                        (String) payload.get("family_name"),
                        email,
                        (String) payload.get("picture")
                );
            } else {
                idUsuario = usuarioService.obtenerIdPorCorreo(email);
            }

            // 2. BUSCAR CREDENCIALES Y SWITCH DE BD
            Usuario usuario = usuarioRepository.findByCorreo(email).orElse(null);
            Long idSeguridad = null; // Lo necesitaremos para la sesión

            if (usuario != null) {
                Seguridad seguridad = seguridadRepository.findByUsuario(usuario);
                if (seguridad != null) {
                    idSeguridad = (long) seguridad.getIdSeguridad(); // Guardamos el ID de seguridad
                    try {
                        dbSwitchService.switchToUser(seguridad.getLoginName(), seguridad.getClaveName());
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Collections.singletonMap("error", "Error de conexión BD"));
                    }
                }
            }

            // --- 🔥 LA PIEZA QUE FALTABA: REGISTRAR SESIÓN ---
            // Obtenemos datos del navegador para la auditoría
            String ip = request.getRemoteAddr();
            String agent = request.getHeader("User-Agent");

            // Registramos la sesión en la tabla seguridad.sesiones y obtenemos el ID
            // Nota: Asegúrate que registrarLogin devuelva el Long del id_sesion
            Long idSesionGenerado = sesionService.registrarLogin(idSeguridad.intValue(), ip, agent, "Google Login");

            // 3. 🔥 GENERAMOS NUESTRO PROPIO JWT DEL SISTEMA
            // ¡AHORA SÍ! Le pasamos los 3 parámetros: email, rol e idSesion
            String tokenSistema = jwtService.generarToken(email, "POSTULANTE", idSesionGenerado);

            // 4. Respuesta final
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("token_sistema", tokenSistema);
            response.put("idSesion", idSesionGenerado); // Opcional: enviarlo al front

            Map<String, Object> user = new HashMap<>();
            user.put("email", email);
            user.put("idUsuario", idUsuario);
            user.put("rol", "POSTULANTE");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}