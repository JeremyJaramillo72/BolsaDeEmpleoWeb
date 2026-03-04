package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Seguridad;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.SeguridadRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200" , allowCredentials = "true")
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
    @Autowired
    private ISesionService sesionService;

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

    private String obtenerIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Si hay múltiples IPs en X-Forwarded-For, tomar la primera
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse,
            HttpSession session
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

                        // 2. BUSCAR CREDENCIALES DE BASE DE DATOS EN ENTIDAD SEGURIDAD
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

                        // 3. Guardar en sesión
                        session.setAttribute("nombre_usuario", usuario.getNombre());
                        session.setAttribute("idUsuario", usuario.getIdUsuario());
                        if (seguridad != null) {
                            session.setAttribute("idSeguridad", seguridad.getIdSeguridad());   // <-- NUEVO
                        }

                        String nombreRol = usuario.getRol().getNombreRol();

                        // 4. Registrar inicio de sesión (auditoría)
                        if (seguridad != null) {
                            String ip = obtenerIp(httpRequest);
                            String navegador = httpRequest.getHeader("User-Agent");
                            String dispositivo = navegador != null && navegador.contains("Mobile") ? "Mobile" : "Desktop";
                            sesionService.registrarLogin(seguridad.getIdSeguridad(), ip, navegador, dispositivo);
                        }

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
        // Registrar cierre de sesión antes de invalidar
        Object idSeguridadObj = session.getAttribute("idSeguridad");
        System.out.println("🔴 idSeguridad en logout: " + idSeguridadObj);
        Integer idSeguridad = (Integer) idSeguridadObj;
        if (idSeguridad != null) {
            sesionService.registrarLogout(idSeguridad);
        }

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