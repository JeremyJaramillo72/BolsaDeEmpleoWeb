package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.UsuarioEmpresaRepository; // Asegúrate de importar esto
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@SessionAttributes({"session_id_usuario", "session_rol"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    // Inyectamos el repositorio correcto para buscar empresas
    @Autowired
    private UsuarioEmpresaRepository usuarioEmpresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/enviar-codigo")
    public ResponseEntity<?> solicitarCodigo(
            @RequestBody Map<String, String> requestData,
            HttpServletRequest request
    ) {
        String correo = requestData.get("Correo");
        System.out.println("Solicitud de código desde: " + request.getRemoteAddr());

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo es obligatorio"));
        }

        try {
            String codigo = String.format("%06d", new Random().nextInt(1000000));
            authService.guardarCodigo(correo, codigo);
            emailService.enviarCodigo(correo, codigo);
            return ResponseEntity.ok(Map.of("mensaje", "Código enviado a " + correo));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error en el servidor de correo"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse,
            HttpSession session,
            Model model
    ) {
        return usuarioRepository.findByCorreo(loginRequest.getCorreo())
                .map(usuario -> {
                    if (passwordEncoder.matches(loginRequest.getContrasena(), usuario.getContrasena())) {


                        session.setAttribute("nombre_usuario", usuario.getNombre());
                        model.addAttribute("session_id_usuario", usuario.getIdUsuario());

                        String nombreRol = usuario.getRol().getNombreRol();
                        model.addAttribute("session_rol", nombreRol);


                        httpResponse.addHeader("X-Auth-Token", UUID.randomUUID().toString());
                        httpResponse.addHeader("X-UTEQ-Session", "Active");

                        Map<String, Object> response = new HashMap<>();
                        response.put("mensaje", "¡Bienvenido de nuevo!");
                        response.put("idUsuario", usuario.getIdUsuario());
                        response.put("rol", usuario.getRol());
                        response.put("nombre", usuario.getNombre());

                        //nuevo nuevo
                        response.put("permisosUi", usuario.getPermisosUi());


                        if (nombreRol != null && nombreRol.equalsIgnoreCase("EMPRESA")) {


                            UsuarioEmpresa empresa = usuarioEmpresaRepository.findByIdUsuario(Long.valueOf(usuario.getIdUsuario()));

                            if (empresa != null) {
                        
                                response.put("idEmpresa", empresa.getIdEmpresa());

                                response.put("empresa", empresa);

                                System.out.println("✅ LOGIN EMPRESA: ID ENCONTRADO " + empresa.getIdEmpresa());
                            } else {
                                System.out.println("⚠️ ES ROL EMPRESA PERO NO ESTÁ EN LA TABLA usuario_empresa");
                            }
                        }

                        return ResponseEntity.ok(response);

                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Collections.singletonMap("error", "Contraseña incorrecta"));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Usuario no registrado")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada y datos destruidos"));
    }

    @GetMapping("/perfil-resumen")
    public ResponseEntity<?> obtenerResumen(HttpSession session) {
        String nombre = (String) session.getAttribute("nombre_usuario");

        if (nombre == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No hay sesión activa");
        }

        return ResponseEntity.ok(Map.of("usuario_actual", nombre, "estado", "Logueado"));
    }
}