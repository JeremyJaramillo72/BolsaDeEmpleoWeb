package com.example.demo.controller;

import com.example.demo.model.Ciudad;
import com.example.demo.model.Usuario;
import com.example.demo.repository.CiudadRepository;
import com.example.demo.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/registro-empresa")
@CrossOrigin(origins = "http://localhost:4200") // Para conectar con tu Angular
public class RegistroEmpresaController {

    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private CiudadRepository ciudadRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/crear")
    public ResponseEntity<?> registrarEmpresa(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Datos de la Cuenta de Usuario
            Usuario usuario = new Usuario();
            usuario.setCorreo((String) payload.get("correo"));
            // Encriptamos la contraseña de inmediato
            usuario.setContrasena(encoder.encode((String) payload.get("contrasena")));
            // 2. Extraemos los datos específicos de la Empresa
            String nombreEmp = (String) payload.get("nombreEmpresa");
            String desc = (String) payload.get("descripcion");
            String web = (String) payload.get("sitioWeb");
            String ruc = (String) payload.get("ruc");

            // Asignamos el nombre de la empresa al campo 'nombre' del usuario
            usuario.setNombre(nombreEmp);

            // 3. Manejo de la Ciudad (idCiudad)
            if (payload.get("idCiudad") != null) {
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("Ciudad con ID " + idCiudad + " no encontrada"));
                usuario.setCiudad(ciudad);
            }

            // 4. Llamada al Service (7 parámetros sincronizados)
            usuarioService.registrarEmpresaCompleta(usuario, nombreEmp, desc, web, ruc);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "¡Registro de empresa exitoso! Ahora puede iniciar sesión."));

        } catch (Exception e) {
            // Captura de errores detallada para la UTEQ
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en el registro de empresa: " + e.getMessage()));
        }
    }
}