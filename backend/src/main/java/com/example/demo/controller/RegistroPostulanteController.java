package com.example.demo.controller;

import com.example.demo.model.Ciudad;
import com.example.demo.model.Usuario;
import com.example.demo.repository.CiudadRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.IUsuarioService; // Cambiado a la Interfaz
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/registro-postulante")
@CrossOrigin(origins = "http://localhost:4200")
public class RegistroPostulanteController {

    // Cambiado: Ahora inyectamos la interfaz IUsuarioService
    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private AuthService authService;

    @Autowired
    private CiudadRepository ciudadRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/crear")
    public ResponseEntity<?> registrarPostulante(@RequestBody Map<String, Object> payload) {
        try {
            String correo = (String) payload.get("Correo");

            // 1. Mapeo manual del Payload al objeto Usuario
            Usuario postulante = new Usuario();
            postulante.setNombre((String) payload.get("Nombre"));
            postulante.setApellido((String) payload.get("Apellido"));
            postulante.setTelefono((String) payload.get("Telefono"));
            postulante.setCorreo(correo);

            // Encriptamos la contraseña antes de pasarla al Service
            postulante.setContrasena(encoder.encode((String) payload.get("Contrasena")));
            postulante.setGenero((String) payload.get("Genero"));

            // Manejo de la fecha de nacimiento
            if (payload.get("FechaNacimiento") != null) {
                postulante.setFechaNacimiento(LocalDate.parse((String) payload.get("FechaNacimiento")));
            }

            // 2. Asignación de Ciudad (Buscamos el objeto completo para el modelo)
            if (payload.get("idCiudad") != null) {
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("Error: La Ciudad con ID " + idCiudad + " no existe."));
                postulante.setCiudad(ciudad);
            }

            // 3. Llamada al Service (Aquí es donde se ejecuta tu procedimiento almacenado)
            usuarioService.registrarUsuarioNormal(postulante);

            // 4. Limpieza de seguridad (opcional según tu lógica de AuthService)
            authService.borrarCodigo(correo);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "¡Postulante registrado con éxito mediante procedimiento!"));

        } catch (Exception e) {
            // Error detallado para depuración en la Bolsa de Empleos
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en el controlador: " + e.getMessage()));
        }
    }
}