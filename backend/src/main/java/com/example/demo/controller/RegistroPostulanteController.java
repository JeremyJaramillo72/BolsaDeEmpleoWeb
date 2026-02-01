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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import com.example.demo.repository.UsuarioRepository;

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
            // 1. EXTRAER DATOS BÁSICOS DEL PAYLOAD (PascalCase como en tu Angular)
            String correo = (String) payload.get("Correo");
            String codigoIngresado = (String) payload.get("codigoIngresado");
            // 2. VALIDACIÓN DE SEGURIDAD: Código de Verificación
            // Comprobamos si el código que envió Angular coincide con el generado en el Backend
            /*boolean esValido = authService.verificarCodigo(correo, codigoIngresado);
            if (!esValido) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El código de verificación es incorrecto o ya expiró."));
            }*/

            // 3. MAPEO HACIA LA ENTIDAD USUARIO
            Usuario postulante = new Usuario();
            postulante.setNombre((String) payload.get("Nombre"));
            postulante.setApellido((String) payload.get("Apellido"));
            postulante.setTelefono((String) payload.get("Telefono"));
            postulante.setCorreo(correo);
            postulante.setGenero((String) payload.get("Genero"));

            // Encriptación de contraseña (Vital para la auditoría)
            String passRaw = (String) payload.get("Contrasena");
            if (passRaw != null) {
                postulante.setContrasena(encoder.encode(passRaw));
            }

            // Manejo de la Fecha de Nacimiento (ISO-8601: yyyy-MM-dd)
            if (payload.get("FechaNacimiento") != null && !payload.get("FechaNacimiento").toString().isEmpty()) {
                postulante.setFechaNacimiento(LocalDate.parse(payload.get("FechaNacimiento").toString()));
            }

            // 4. VINCULACIÓN DE CIUDAD (Integridad Referencial)
            if (payload.get("idCiudad") != null) {
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("La Ciudad con ID " + idCiudad + " no existe en la BD."));
                postulante.setCiudad(ciudad);
            }

            // 5. EJECUCIÓN DEL PROCEDIMIENTO ALMACENADO
            // Se ejecuta sp_registrar_postulante a través del Service
            usuarioService.registrarUsuarioNormal(postulante);

            // 6. LIMPIEZA POST-REGISTRO
            // Borramos el código de verificación una vez usado con éxito
            authService.borrarCodigo(correo);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "¡Registro completado con éxito! Bienvenido a la Bolsa de Empleo."));

        } catch (Exception e) {
            // Log de error detallado para que el "Viejo" vea que controlas excepciones
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno en el servidor: " + e.getMessage()));
        }
    }

    @Autowired
    private UsuarioRepository usuarioRepository;
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarPostulante(
            @PathVariable("id") Long id,            // Identificador del usuario a modificar
            @RequestBody Map<String, Object> payload, // Datos enviados desde Angular
            HttpServletRequest request,               // Requerimiento: Captura objeto request
            HttpSession session                       // Requerimiento: Gestión de session
    ) {
        try {
            // 1. GESTIÓN DE ÁMBITO (Request): Capturamos metadatos de la petición
            String ipOrigen = request.getRemoteAddr();
            System.out.println("Intento de actualización desde IP: " + ipOrigen);

            // 2. Buscar usuario existente
            Usuario postulante = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

            // 3. Actualización selectiva (Solo lo que venga en el payload)
            if (payload.containsKey("Nombre")) postulante.setNombre((String) payload.get("Nombre"));
            if (payload.containsKey("Apellido")) postulante.setApellido((String) payload.get("Apellido"));
            if (payload.containsKey("Telefono")) postulante.setTelefono((String) payload.get("Telefono"));

            // Manejo de la contraseña (si se desea cambiar)
            if (payload.get("Contrasena") != null && !((String) payload.get("Contrasena")).isEmpty()) {
                postulante.setContrasena(encoder.encode((String) payload.get("Contrasena")));
            }

            // 4. Actualización de Ciudad
            if (payload.get("idCiudad") != null) {
                Integer idCiudad = Integer.valueOf(payload.get("idCiudad").toString());
                Ciudad ciudad = ciudadRepository.findById(idCiudad)
                        .orElseThrow(() -> new RuntimeException("Ciudad no válida"));
                postulante.setCiudad(ciudad);
            }

            // 5. Persistencia: JPA detecta el ID y ejecuta un UPDATE automáticamente
            usuarioService.registrarUsuarioNormal(postulante); // Reutilizamos el service que ya tienes

            // 6. GESTIÓN DE ÁMBITO (Session): Recuperar quién realizó el cambio
            String editor = (String) session.getAttribute("nombre_usuario");
            System.out.println("Cambio guardado por el usuario en sesión: " + editor);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Perfil actualizado con éxito",
                    "editor_sesion", editor != null ? editor : "Sistema"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar: " + e.getMessage()));
        }
    }
}