package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.model.Ciudad;
import com.example.demo.repository.CiudadRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private IUsuarioService usuarioService;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    // Inyectamos el repo de ciudad para validar que exista antes de registrar
    @Autowired
    private CiudadRepository ciudadRepository;

    @PostMapping("/crear")
    public ResponseEntity<?> registrarAdmin(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Mapeo de datos básicos
            Usuario admin = new Usuario();
            admin.setNombre((String) payload.get("Nombre"));
            admin.setApellido((String) payload.get("Apellido"));
            admin.setCorreo((String) payload.get("Correo"));
            admin.setTelefono((String) payload.get("Telefono"));

            // 2. Encriptación de contraseña
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

            // 4. Llamada al Service (que ejecuta el SP)
            usuarioService.registrarAdministrador(admin);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Administrador registrado con éxito"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar admin: " + e.getMessage()));
        }
    }
}