package com.example.demo.controller;

import com.example.demo.service.AuthService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            // Si algo falla (ej. error de conexión SMTP), devolvemos error 500
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "No se pudo enviar el correo. Revisa la configuración del servidor."));
        }
    }
}