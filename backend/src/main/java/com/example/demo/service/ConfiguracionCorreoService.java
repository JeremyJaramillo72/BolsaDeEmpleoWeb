package com.example.demo.service;

import com.example.demo.config.DynamicMailConfig;
import com.example.demo.dto.ConfiguracionCorreoDTO;
import com.example.demo.model.Auditoria;
import com.example.demo.model.ConfiguracionCorreo;
import com.example.demo.model.Seguridad;
import com.example.demo.model.Usuario;
import com.example.demo.repository.AuditoriaRepository;
import com.example.demo.repository.ConfiguracionCorreoRepository;
import com.example.demo.repository.SeguridadDbRepository;
import com.example.demo.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfiguracionCorreoService {

    private final ConfiguracionCorreoRepository configuracionRepo;
    private final AuditoriaRepository auditoriaRepo;
    private final SeguridadDbRepository seguridadRepo;
    private final UsuarioRepository usuarioRepo;
    private final DynamicMailConfig dynamicMailConfig;
    private final NotificacionService notificacionService;
    private final ObjectMapper objectMapper;

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final Pattern emailPattern = Pattern.compile(EMAIL_REGEX);

    /**
     * Obtener configuración actual de correo
     */
    @Transactional(readOnly = true)
    public ConfiguracionCorreoDTO obtenerConfiguracion() {
        ConfiguracionCorreo config = configuracionRepo
                .findByTipoAndActivo("EMAIL_FROM", true)
                .orElse(null);

        if (config == null) {
            return null;
        }

        return mapearADTO(config);
    }

    /**
     * Probar conexión con un nuevo correo (sin guardar)
     */
    @Transactional
    public void probarCorreo(String correoNuevo) throws Exception {
        if (!validarFormatoCorreo(correoNuevo)) {
            throw new IllegalArgumentException("Formato de correo inválido: " + correoNuevo);
        }

        try {
            var mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(correoNuevo);
            helper.setTo(correoNuevo);
            helper.setSubject("🔐 Prueba de Configuración - Bolsa de Empleos");
            helper.setText(generarTemplateProbaCorreo(correoNuevo), true);

            mailSender.send(mensaje);
            log.info("✅ Email de prueba enviado exitosamente a: " + correoNuevo);

        } catch (MailException e) {
            log.error("❌ Error enviando email de prueba: " + e.getMessage());
            throw new RuntimeException("No se pudo enviar el email de prueba. Verifica la dirección: " + correoNuevo, e);
        } catch (Exception e) {
            log.error("❌ Error procesando email de prueba: " + e.getMessage());
            throw new RuntimeException("Error al procesar el email de prueba: " + e.getMessage(), e);
        }
    }

    /**
     * Actualizar solo el correo (método simplificado, ahora no se usa)
     */

    /**
     * Actualizar configuración de email y contraseña
     */
    @Transactional
    public void actualizarConfiguracionSmtp(ConfiguracionCorreoDTO configDTO, Long idUsuario, String ipAddress) throws Exception {
        try {
            Usuario usuario = usuarioRepo.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Seguridad seguridad = seguridadRepo.findByUsuario(usuario)
                    .orElseThrow(() -> new RuntimeException("Usuario de seguridad no encontrado"));

            // Validaciones
            if (configDTO.getValor() == null || configDTO.getValor().trim().isEmpty()) {
                throw new IllegalArgumentException("El correo no puede estar vacío");
            }
            if (!validarFormatoCorreo(configDTO.getValor())) {
                throw new IllegalArgumentException("Formato de correo inválido: " + configDTO.getValor());
            }
            if (configDTO.getPassword() == null || configDTO.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("La contraseña/token no puede estar vacío");
            }

            ConfiguracionCorreo config = configuracionRepo
                    .findByTipo("EMAIL_FROM")
                    .orElse(new ConfiguracionCorreo());

            // Guardar valores anteriores para auditoria
            Map<String, Object> datosAnteriores = new HashMap<>();
            datosAnteriores.put("valor", config.getValor());
            datosAnteriores.put("password", config.getPassword() != null ? "***ENCRIPTADA***" : null);

            config.setTipo("EMAIL_FROM");
            config.setValor(configDTO.getValor());
            config.setPassword(configDTO.getPassword());
            config.setActivo(true);

            ConfiguracionCorreo configGuardada = configuracionRepo.save(config);

            // Registrar en auditoria
            Auditoria auditoria = new Auditoria();
            auditoria.setIdSeguridad(seguridad.getIdSeguridad());
            auditoria.setUsuarioDb(seguridad.getLoginName());
            auditoria.setFechaHora(LocalDateTime.now());
            auditoria.setAccion("UPDATE");
            auditoria.setTablaAfectada("configuracion_correo");
            auditoria.setIdRegistroAfectado(configGuardada.getIdConfiguracion());

            Map<String, Object> datosNuevos = new HashMap<>();
            datosNuevos.put("valor", configDTO.getValor());
            datosNuevos.put("password", "***ENCRIPTADA***");
            datosNuevos.put("ipAddress", ipAddress);
            datosNuevos.put("nombreAdmin", usuario.getNombre());

            auditoria.setDatosAnteriores(objectMapper.writeValueAsString(datosAnteriores));
            auditoria.setDatosNuevos(objectMapper.writeValueAsString(datosNuevos));

            auditoriaRepo.save(auditoria);

            log.info("✅ Configuración actualizada por: " + usuario.getNombre());

            // Notificar a admins
            enviarNotificacionCambio(usuario, configGuardada.getValor());

        } catch (Exception e) {
            log.error("❌ Error actualizando configuración: " + e.getMessage());
            guardarCambioFallido(idUsuario, e.getMessage(), ipAddress);
            throw e;
        }
    }

    /**
     * Obtener historial de cambios para la timeline desde Auditoria
     */
    @Transactional(readOnly = true)
    public List<ConfiguracionCorreoDTO.HistorialItem> obtenerHistorial() {
        ConfiguracionCorreo config = configuracionRepo
                .findByTipoAndActivo("EMAIL_FROM", true)
                .orElse(null);

        if (config == null) {
            return new ArrayList<>();
        }

        List<Auditoria> registros = auditoriaRepo
                .findByTablaAfectadaAndIdRegistroAfectadoOrderByFechaHoraDesc(
                        "configuracion_correo",
                        config.getIdConfiguracion()
                );

        List<ConfiguracionCorreoDTO.HistorialItem> items = new ArrayList<>();
        for (Auditoria reg : registros) {
            try {
                ConfiguracionCorreoDTO.HistorialItem item = new ConfiguracionCorreoDTO.HistorialItem();

                // Obtener info del admin desde Seguridad
                Seguridad seguridad = seguridadRepo.findById(reg.getIdSeguridad()).orElse(null);
                if (seguridad != null && seguridad.getUsuario() != null) {
                    item.setAdminNombre(seguridad.getUsuario().getNombre());
                    item.setAdminEmail(seguridad.getUsuario().getCorreo());
                } else {
                    item.setAdminNombre("Usuario Eliminado");
                    item.setAdminEmail("N/A");
                }

                item.setIdHistorial(reg.getIdAuditoria());
                item.setAccion(reg.getAccion());
                item.setFechaCreacion(reg.getFechaHora());
                item.setExitoso(true); // Si está en auditoria es que se guardó exitosamente

                // Parse JSON para obtener valores anteriores y nuevos
                if (reg.getDatosAnteriores() != null) {
                    Map<String, Object> datosAnt = objectMapper.readValue(reg.getDatosAnteriores(), Map.class);
                    Object valorAnt = datosAnt.get("valor");
                    item.setValorAnterior(valorAnt != null ? valorAnt.toString() : "");
                }

                if (reg.getDatosNuevos() != null) {
                    Map<String, Object> datosNue = objectMapper.readValue(reg.getDatosNuevos(), Map.class);
                    Object valorNue = datosNue.get("valor");
                    item.setValorNuevo(valorNue != null ? valorNue.toString() : "");
                    Object ipAddr = datosNue.get("ipAddress");
                    if (ipAddr != null) {
                        item.setIpAddress(ipAddr.toString());
                    }
                }

                items.add(item);
            } catch (Exception e) {
                log.error("Error procesando historial: " + e.getMessage());
            }
        }
        return items;
    }

    /**
     * Enviar notificación a todos los admins
     */
    private void enviarNotificacionCambio(Usuario adminQueHizoCambio, String correoNuevo) {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("adminNombre", adminQueHizoCambio.getNombre());
            variables.put("correoNuevo", correoNuevo);
            variables.put("fecha", LocalDateTime.now().toString());

            Map<String, Object> datos = new HashMap<>();
            datos.put("tipoConfiguracion", "EMAIL_FROM");
            datos.put("adminId", adminQueHizoCambio.getIdUsuario());

            notificacionService.notificarAdminsDirecto(
                    "configuracion_correo_actualizada",
                    variables,
                    datos,
                    "/menu-principal/configuracion-correo",
                    "settings_backup_restore"
            );
        } catch (Exception e) {
            log.warn("⚠️ Error notificando cambio de correo: " + e.getMessage());
        }
    }

    /**
     * Guardar cambio fallido en auditoria
     */
    private void guardarCambioFallido(Long idUsuario, String error, String ipAddress) {
        try {
            Usuario usuario = usuarioRepo.findById(idUsuario).orElse(null);
            if (usuario == null) return;

            Seguridad seguridad = seguridadRepo.findByUsuario(usuario).orElse(null);
            if (seguridad == null) return;

            ConfiguracionCorreo config = configuracionRepo
                    .findByTipo("EMAIL_FROM")
                    .orElse(null);
            if (config == null) return;

            Auditoria auditoria = new Auditoria();
            auditoria.setIdSeguridad(seguridad.getIdSeguridad());
            auditoria.setUsuarioDb(seguridad.getLoginName());
            auditoria.setFechaHora(LocalDateTime.now());
            auditoria.setAccion("UPDATE");
            auditoria.setTablaAfectada("configuracion_correo");
            auditoria.setIdRegistroAfectado(config.getIdConfiguracion());

            Map<String, Object> datosNuevos = new HashMap<>();
            datosNuevos.put("ipAddress", ipAddress);
            datosNuevos.put("error", error);
            datosNuevos.put("nombreAdmin", usuario.getNombre());

            auditoria.setDatosNuevos(objectMapper.writeValueAsString(datosNuevos));
            auditoriaRepo.save(auditoria);

            log.error("⚠️ Cambio fallido registrado en auditoria: " + error);
        } catch (Exception e) {
            log.error("Error guardando cambio fallido: " + e.getMessage());
        }
    }

    /**
     * Validar formato de correo electrónico
     */
    private boolean validarFormatoCorreo(String correo) {
        return correo != null && emailPattern.matcher(correo).matches();
    }

    /**
     * Template HTML para email de prueba
     */
    private String generarTemplateProbaCorreo(String correoNuevo) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .content { padding: 30px 20px; }
                        .status-card { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .email-info { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: 'Courier New', monospace; word-break: break-all; }
                        .footer { background: #f5f7fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e6ed; }
                        .success-icon { font-size: 48px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="success-icon">✅</div>
                            <h1>Correo de Prueba</h1>
                        </div>
                        <div class="content">
                            <h2>Configuración de Correo Exitosa</h2>
                            <p>Este es un mensaje de prueba para validar que la nueva configuración de correo funciona correctamente.</p>

                            <div class="status-card">
                                <strong>Estado:</strong> ✅ Conexión exitosa
                            </div>

                            <h3>Detalles:</h3>
                            <p><strong>Correo remitente (FROM):</strong></p>
                            <div class="email-info">""" + correoNuevo + """
                            </div>

                            <p><strong>Fecha de prueba:</strong></p>
                            <div class="email-info">""" + LocalDateTime.now() + """
                            </div>

                            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                ℹ️ <strong>Nota:</strong> Si recibes este correo es porque la configuración está funcionando correctamente.
                                Puedes proceder a guardar los cambios.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Bolsa de Empleos - Sistema de Administración</p>
                            <p style="color: #999;">Mensaje automático del sistema</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }

    private ConfiguracionCorreoDTO mapearADTO(ConfiguracionCorreo config) {
        return new ConfiguracionCorreoDTO(
                config.getIdConfiguracion(),
                config.getTipo(),
                config.getValor(),
                config.getPassword() != null ? "***ENCRIPTADA***" : null,
                config.getActivo(),
                config.getFechaCreacion(),
                config.getFechaModificacion()
        );
    }
}
