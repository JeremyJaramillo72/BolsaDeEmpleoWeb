package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Seguridad;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.SeguridadRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.DbSwitchService;
import com.example.demo.service.EmailService;
import com.example.demo.service.IUsuarioService;
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

    @Autowired
    private UsuarioEmpresaRepository usuarioEmpresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DbSwitchService dbSwitchService;

    @Autowired
    private SeguridadRepository seguridadRepository;

    @PostMapping("/enviar-codigo")
    public ResponseEntity<?> solicitarCodigo(
            @RequestBody Map<String, String> requestData,
            HttpServletRequest request
    ) {
        String correo = requestData.get("Correo");
        System.out.println("solicitud de código desde: " + request.getRemoteAddr());

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "el correo es obligatorio"));
        }

        try {
            String codigo = String.format("%06d", new Random().nextInt(1000000));
            authService.guardarCodigo(correo, codigo);
            emailService.enviarCodigo(correo, codigo);
            return ResponseEntity.ok(Map.of("mensaje", "código enviado a " + correo));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "error en el servidor de correo"));
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
                    // 1. Validar contraseña del aplicativo
                    if (passwordEncoder.matches(loginRequest.getContrasena(), usuario.getContrasena())) {

                        // 👇 VALIDACIÓN DE ESTADO Y ENVÍO DE CORREO 👇
                        String estado = usuario.getEstadoValidacion();
                        String estadoActual = (estado != null && !estado.isEmpty()) ? estado : "Pendiente";

                        if (!estadoActual.equalsIgnoreCase("Aprobado") && !estadoActual.equalsIgnoreCase("Activo")) {

                            // Enviamos el correo de advertencia
                            try {
                                emailService.enviarCorreoCuentaNoAprobada(usuario.getCorreo(), usuario.getNombre(), estadoActual);
                            } catch (Exception e) {
                                System.out.println("aviso: no se pudo enviar el correo de bloqueo: " + e.getMessage());
                            }

                            // Personalizamos el mensaje según el estado
                            String msjFront = estadoActual.equalsIgnoreCase("Rechazado")
                                    ? "tu solicitud de cuenta fue rechazada. comunícate con el administrador."
                                    : "tu cuenta aún está en revisión. no puedes iniciar sesión hasta ser aprobado.";

                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(Collections.singletonMap("error", msjFront));
                        }
                        // 👆 FIN DE LA VALIDACIÓN 👆

                        // 3. BUSCAR CREDENCIALES DE BASE DE DATOS EN ENTIDAD SEGURIDAD
                        Seguridad seguridad = seguridadRepository.findByUsuario(usuario);
                        if (seguridad != null) {
                            try {
                                // HACEMOS EL SWITCH FÍSICO A LA BD
                                dbSwitchService.switchToUser(seguridad.getLoginName(), seguridad.getClaveName());
                            } catch (Exception e) {
                                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Collections.singletonMap("error", "No se pudo establecer conexión con sus credenciales de BD"));
                            }
                        }

                        // 4. Guardar en sesión
                        session.setAttribute("nombre_usuario", usuario.getNombre());
                        session.setAttribute("idUsuario", usuario.getIdUsuario());
                        model.addAttribute("session_id_usuario", usuario.getIdUsuario());

                        String nombreRol = usuario.getRol().getNombreRol();
                        model.addAttribute("session_rol", nombreRol);

                        httpResponse.addHeader("X-Auth-Token", UUID.randomUUID().toString());
                        httpResponse.addHeader("X-UTEQ-Session", "Active");

                        // Respuesta al Frontend
                        Map<String, Object> response = new HashMap<>();
                        response.put("mensaje", "¡bienvenido de nuevo!");
                        response.put("idUsuario", usuario.getIdUsuario());
                        response.put("rol", usuario.getRol());
                        response.put("nombre", usuario.getNombre());
                        response.put("permisosUi", usuario.getPermisosUi());

                        if (nombreRol != null && nombreRol.equalsIgnoreCase("EMPRESA")) {
                            UsuarioEmpresa empresa = usuarioEmpresaRepository.findByIdUsuario(Long.valueOf(usuario.getIdUsuario()));

                            if (empresa != null) {
                                response.put("idEmpresa", empresa.getIdEmpresa());
                                response.put("empresa", empresa);
                                System.out.println("✅ login empresa: id encontrado " + empresa.getIdEmpresa());
                            } else {
                                System.out.println("⚠️ es rol empresa pero no está en la tabla usuario_empresa");
                            }
                        }

                        return ResponseEntity.ok(response);

                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Collections.singletonMap("error", "contraseña incorrecta"));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "usuario no registrado")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        // CUANDO CIERRA SESIÓN, REGRESAMOS AL USUARIO POR DEFECTO DEL BACKEND
        dbSwitchService.resetToDefault();
        session.invalidate();
        return ResponseEntity.ok(Map.of("mensaje", "Conexión de BD cerrada y sesión finalizada"));
    }

    @GetMapping("/perfil-resumen")
    public ResponseEntity<?> obtenerResumen(HttpSession session) {
        String nombre = (String) session.getAttribute("nombre_usuario");

        if (nombre == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("no hay sesión activa");
        }

        return ResponseEntity.ok(Map.of("usuario_actual", nombre, "estado", "logueado"));
    }
}