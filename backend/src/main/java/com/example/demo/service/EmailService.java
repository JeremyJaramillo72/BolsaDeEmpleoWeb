package com.example.demo.service;

import com.example.demo.config.DynamicMailConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final DynamicMailConfig dynamicMailConfig;

    public void enviarCodigo(String destino, String codigo) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setTo(destino);
            helper.setSubject("Código de Verificación - Bolsa de Empleos");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setText(generarTemplateCodigoVerificacion(codigo), true);
            mailSender.send(mensaje);
            log.info("✅ Correo de verificación enviado a: {}", destino);
        } catch (MailException e) {
            log.error("❌ Error enviando email de verificación a {}: {}", destino, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar email de verificación a {}: {}", destino, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar email de verificación a {}: {}", destino, e.getMessage());
        }
    }

    public void enviarCorreoValidacion(String destinatario, String nombreEmpresa, String estado) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setTo(destinatario);
            helper.setSubject("Respuesta de Solicitud - Bolsa de Empleos");
            helper.setText(generarTemplateValidacion(nombreEmpresa, estado), true);
            mailSender.send(mensaje);
            log.info("✅ Correo de validación enviado a: {}", destinatario);
        } catch (MailException e) {
            log.error("❌ Error enviando email de validación a {}: {}", destinatario, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar email de validación a {}: {}", destinatario, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar email de validación a {}: {}", destinatario, e.getMessage());
        }
    }

    public void enviarCorreoCuentaNoAprobada(String destinatario, String nombreEmpresa, String estadoActual) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setTo(destinatario);
            helper.setSubject("Aviso de Inicio de Sesión - Bolsa de Empleos");
            helper.setText(generarTemplateCuentaNoAprobada(nombreEmpresa, estadoActual), true);
            mailSender.send(mensaje);
            log.info("✅ Correo de cuenta no aprobada enviado a: {}", destinatario);
        } catch (MailException e) {
            log.error("❌ Error enviando email de cuenta no aprobada a {}: {}", destinatario, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar email de cuenta no aprobada a {}: {}", destinatario, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar email de cuenta no aprobada a {}: {}", destinatario, e.getMessage());
        }
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(generarTemplateGenerico(text), true);
            mailSender.send(mensaje);
            log.info("✅ Email simple enviado a: {}", to);
        } catch (MailException e) {
            log.error("❌ Error enviando email simple a {}: {}", to, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar email simple a {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar email simple a {}: {}", to, e.getMessage());
        }
    }

    public void notificarLoginAdmin(String adminEmail, String ipAddress, String location) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setTo(adminEmail);
            helper.setSubject("🔒 ALERTA DE SEGURIDAD: Nuevo inicio de sesión de Administrador");

            String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            helper.setText(generarTemplateAlertaSeguridad(time, ipAddress, location), true);
            mailSender.send(mensaje);
            log.info("✅ Alerta de seguridad enviada a: {}", adminEmail);
        } catch (MailException e) {
            log.error("❌ Error enviando alerta de seguridad a {}: {}", adminEmail, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar alerta de seguridad a {}: {}", adminEmail, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar alerta de seguridad a {}: {}", adminEmail, e.getMessage());
        }
    }

    public void notificarAprobacionEmpresa(String correoEmpresa, String nombreEmpresa) {
        try {
            JavaMailSender mailSender = dynamicMailConfig.getJavaMailSender();
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(obtenerCorreoConfiguracion());
            helper.setTo(correoEmpresa);
            helper.setSubject("✅ Tu Empresa ha sido Aprobada - Bolsa de Empleos");
            helper.setText(generarTemplateAprobacionEmpresa(nombreEmpresa), true);
            mailSender.send(mensaje);
            log.info("✅ Correo de aprobación de empresa enviado a: {}", correoEmpresa);
        } catch (MailException e) {
            log.error("❌ Error enviando correo de aprobación a {}: {}", correoEmpresa, e.getMessage());
        } catch (MessagingException e) {
            log.error("❌ Error de mensajería al enviar correo de aprobación a {}: {}", correoEmpresa, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar correo de aprobación a {}: {}", correoEmpresa, e.getMessage());
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Obtener el correo configurado desde la base de datos
     */
    private String obtenerCorreoConfiguracion() {
        try {
            return dynamicMailConfig.obtenerCorreoConfiguracion();
        } catch (Exception e) {
            log.warn("⚠️ Error obteniendo correo de configuración: {}. Usando correo por defecto.", e.getMessage());
            return "noreply@bolsa-empleos.uteq.edu.ec";
        }
    }

    // ==================== TEMPLATES HTML ====================

    private String generarTemplateCodigoVerificacion(String codigo) {
        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }" +
            ".header h1 { margin: 0; font-size: 24px; font-weight: 700; }" +
            ".content { padding: 40px 30px; text-align: center; }" +
            ".codigo-box { background-color: #f0f4ff; border: 2px solid #667eea; border-radius: 8px; padding: 30px; margin: 30px 0; }" +
            ".codigo { font-size: 48px; font-weight: 700; color: #667eea; letter-spacing: 8px; text-align: center; font-family: 'Courier New', monospace; }" +
            ".descripcion { color: #64748b; font-size: 14px; line-height: 1.6; }" +
            ".footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }" +
            ".footer p { margin: 5px 0; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><h1>Código de Verificación</h1></div>" +
            "<div class=\"content\">" +
            "<p class=\"descripcion\">Se ha solicitado un código de verificación para tu cuenta en Bolsa de Empleos.</p>" +
            "<div class=\"codigo-box\"><div class=\"codigo\">" + codigo + "</div></div>" +
            "<p class=\"descripcion\">Este código es válido por <strong>10 minutos</strong>. No compartas este código con nadie.</p>" +
            "<p class=\"descripcion\">Si no solicitaste este código, ignora este correo.</p>" +
            "</div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p><p>© 2026 Todos los derechos reservados</p></div>" +
            "</div></body></html>";
    }

    private String generarTemplateValidacion(String nombreEmpresa, String estado) {
        boolean aprobado = estado.equalsIgnoreCase("Aprobado");
        String colorEstado = aprobado ? "#16a34a" : "#dc2626";
        String iconoEstado = aprobado ? "✓" : "✕";
        String gradient = aprobado ?
            "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" :
            "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";

        String contenidoAdicional = aprobado ?
            "<p class=\"exito\"><strong>¡Felicidades! Ya puede iniciar sesión en la plataforma</strong> y publicar sus ofertas de trabajo.</p>" :
            "<p class=\"error\"><strong>Lo sentimos,</strong> su cuenta no cumple con los requisitos actuales. Por favor, póngase en contacto con el administrador para más detalles.</p>";

        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }" +
            ".header { background: " + gradient + "; padding: 50px 30px; text-align: center; color: white; }" +
            ".header .icono { font-size: 56px; margin-bottom: 15px; }" +
            ".header h1 { margin: 0; font-size: 26px; font-weight: 700; }" +
            ".header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }" +
            ".content { padding: 40px 30px; }" +
            ".greeting { color: #1e293b; font-size: 16px; margin-bottom: 20px; }" +
            ".estado-box { background-color: #f0fdf4; border-left: 4px solid " + colorEstado + "; padding: 20px; border-radius: 8px; margin: 25px 0; }" +
            ".estado-box.rechazado { background-color: #fef2f2; border-left-color: #dc2626; }" +
            ".estado-label { color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }" +
            ".estado-valor { color: " + colorEstado + "; font-size: 18px; font-weight: 700; }" +
            ".exito { color: #15803d; line-height: 1.6; }" +
            ".error { color: #b91c1c; line-height: 1.6; }" +
            ".descripcion { color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0; }" +
            ".footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }" +
            ".footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><div class=\"icono\">" + iconoEstado + "</div>" +
            "<h1>Estado de su Solicitud</h1><p>Respuesta de Bolsa de Empleos</p></div>" +
            "<div class=\"content\">" +
            "<p class=\"greeting\">Estimado <strong>" + nombreEmpresa + "</strong>,</p>" +
            "<p class=\"descripcion\">Le informamos que el estado de su solicitud de registro de empresa ha sido actualizado.</p>" +
            "<div class=\"estado-box " + (!aprobado ? "rechazado" : "") + "\">" +
            "<div class=\"estado-label\">Estado Actual</div>" +
            "<div class=\"estado-valor\">" + estado + "</div></div>" +
            contenidoAdicional +
            "<p class=\"descripcion\">Si tiene alguna pregunta, puede contactarnos a través del formulario de soporte en la plataforma.</p>" +
            "</div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p>" +
            "<p>© 2026 Universidad Técnica Estatal de Quevedo</p>" +
            "<p>Todos los derechos reservados</p></div></div></body></html>";
    }

    private String generarTemplateCuentaNoAprobada(String nombreEmpresa, String estadoActual) {
        String mensaje = estadoActual.equalsIgnoreCase("Pendiente") ?
            "Nuestros administradores aún están revisando tu información. Te notificaremos en cuanto seas aprobado para que puedas acceder." :
            "Por favor, comunícate con soporte para más detalles sobre el estado de tu cuenta.";

        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }" +
            ".header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; color: white; }" +
            ".header .icono { font-size: 48px; margin-bottom: 15px; }" +
            ".header h1 { margin: 0; font-size: 24px; font-weight: 700; }" +
            ".content { padding: 40px 30px; }" +
            ".alerta-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }" +
            ".alerta-titulo { color: #b45309; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }" +
            ".alerta-contenido { color: #92400e; font-size: 14px; line-height: 1.6; }" +
            ".estado-actual { color: #d97706; font-weight: 700; }" +
            ".descripcion { color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0; }" +
            ".footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }" +
            ".footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><div class=\"icono\">⚠️</div>" +
            "<h1>Aviso de Acceso Restringido</h1></div>" +
            "<div class=\"content\">" +
            "<p class=\"descripcion\">Hola <strong>" + nombreEmpresa + "</strong>,</p>" +
            "<p class=\"descripcion\">Hemos detectado un intento de inicio de sesión en tu cuenta. Te recordamos que tu perfil actualmente se encuentra en estado:</p>" +
            "<div class=\"alerta-box\">" +
            "<div class=\"alerta-titulo\">Estado Actual</div>" +
            "<div class=\"alerta-contenido\"><span class=\"estado-actual\">" + estadoActual.toUpperCase() + "</span></div></div>" +
            "<p class=\"descripcion\">" + mensaje + "</p>" +
            "<p class=\"descripcion\">Si crees que esto es un error o tienes preguntas, no dudes en contactar con nuestro equipo de soporte.</p>" +
            "</div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p>" +
            "<p>© 2026 Universidad Técnica Estatal de Quevedo</p>" +
            "<p>Todos los derechos reservados</p></div></div></body></html>";
    }

    private String generarTemplateGenerico(String contenido) {
        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }" +
            ".header h1 { margin: 0; font-size: 24px; font-weight: 700; }" +
            ".content { padding: 40px 30px; }" +
            ".content p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0; }" +
            ".footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }" +
            ".footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><h1>Bolsa de Empleos UTEQ</h1></div>" +
            "<div class=\"content\"><p>" + contenido + "</p></div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p>" +
            "<p>© 2026 Universidad Técnica Estatal de Quevedo</p>" +
            "<p>Todos los derechos reservados</p></div></div></body></html>";
    }

    private String generarTemplateAlertaSeguridad(String tiempo, String ip, String ubicacion) {
        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(220,38,38,0.15); }" +
            ".header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; color: white; }" +
            ".header .icono { font-size: 48px; margin-bottom: 15px; }" +
            ".header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }" +
            ".content { padding: 40px 30px; }" +
            ".alerta-texto { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 25px 0; }" +
            ".alerta-texto p { color: #7f1d1d; margin: 8px 0; font-size: 14px; line-height: 1.6; }" +
            ".detalles { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; }" +
            ".detalle-fila { display: flex; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }" +
            ".detalle-fila:last-child { border-bottom: none; }" +
            ".detalle-etiqueta { color: #64748b; font-weight: 600; width: 120px; font-size: 13px; text-transform: uppercase; }" +
            ".detalle-valor { color: #1e293b; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; }" +
            ".accion { background-color: #fecaca; color: #7f1d1d; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 14px; line-height: 1.6; font-weight: 500; }" +
            ".descripcion { color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0; }" +
            ".footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }" +
            ".footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }" +
            "h3 { color: #1e293b; margin-top: 30px; margin-bottom: 15px; font-size: 16px; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><div class=\"icono\">🔒</div>" +
            "<h1>Alerta de Seguridad</h1></div>" +
            "<div class=\"content\">" +
            "<div class=\"alerta-texto\">" +
            "<p><strong>Se ha detectado un inicio de sesión en tu cuenta de Administrador.</strong></p>" +
            "<p>Si reconoces esta actividad, puedes ignorar este mensaje de seguridad. Si no reconoces este inicio de sesión, por favor actúa inmediatamente.</p>" +
            "</div>" +
            "<h3>Detalles del Inicio de Sesión</h3>" +
            "<div class=\"detalles\">" +
            "<div class=\"detalle-fila\"><div class=\"detalle-etiqueta\">Hora</div><div class=\"detalle-valor\">" + tiempo + " (UTC-5)</div></div>" +
            "<div class=\"detalle-fila\"><div class=\"detalle-etiqueta\">Dirección IP</div><div class=\"detalle-valor\">" + ip + "</div></div>" +
            "<div class=\"detalle-fila\"><div class=\"detalle-etiqueta\">Ubicación</div><div class=\"detalle-valor\">" + ubicacion + "</div></div>" +
            "</div>" +
            "<div class=\"accion\"><strong>⚠️ Acciones Recomendadas</strong><br>Si no fuiste quien inició sesión, cambia tu contraseña inmediatamente y contacta a soporte.</div>" +
            "<p class=\"descripcion\">Para tu seguridad, no compartimos contraseñas por correo. Si sospechas de una actividad fraudulenta, accede a tu cuenta directamente desde la plataforma web y cambia tu contraseña.</p>" +
            "</div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p>" +
            "<p>© 2026 Universidad Técnica Estatal de Quevedo</p>" +
            "<p>Todos los derechos reservados</p></div></div></body></html>";
    }

    private String generarTemplateAprobacionEmpresa(String nombreEmpresa) {
        return "<html lang=\"es\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }" +
            ".header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 50px 30px; text-align: center; color: white; }" +
            ".header .icono { font-size: 56px; margin-bottom: 15px; }" +
            ".header h1 { margin: 0; font-size: 26px; font-weight: 700; }" +
            ".content { padding: 40px 30px; }" +
            ".greeting { color: #1e293b; font-size: 16px; margin-bottom: 20px; }" +
            ".success-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0; }" +
            ".success-label { color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }" +
            ".success-mensaje { color: #15803d; font-size: 16px; font-weight: 700; line-height: 1.6; }" +
            ".descripcion { color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0; }" +
            ".boton { display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; text-align: center; }" +
            ".footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }" +
            ".footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }" +
            "</style></head><body>" +
            "<div class=\"container\">" +
            "<div class=\"header\"><div class=\"icono\">✅</div>" +
            "<h1>¡Empresa Aprobada!</h1></div>" +
            "<div class=\"content\">" +
            "<p class=\"greeting\">Estimado <strong>" + nombreEmpresa + "</strong>,</p>" +
            "<p class=\"descripcion\">Nos complace informarte que tu empresa ha sido <strong>aprobada oficialmente</strong> en la Bolsa de Empleos UTEQ.</p>" +
            "<div class=\"success-box\">" +
            "<div class=\"success-label\">Estado</div>" +
            "<div class=\"success-mensaje\">✓ Aprobado - Acceso Activo</div></div>" +
            "<p class=\"descripcion\"><strong>¿Qué puedes hacer ahora?</strong></p>" +
            "<ul style=\"color: #64748b; font-size: 14px; line-height: 1.8;\">" +
            "<li>✓ Iniciar sesión en tu cuenta empresarial</li>" +
            "<li>✓ Publicar ofertas de empleo</li>" +
            "<li>✓ Revisar postulaciones de candidatos</li>" +
            "<li>✓ Contactar con candidatos interesados</li>" +
            "</ul>" +
            "<p class=\"descripcion\">Si tienes alguna duda o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>" +
            "</div>" +
            "<div class=\"footer\"><p><strong>Bolsa de Empleos UTEQ</strong></p>" +
            "<p>© 2026 Universidad Técnica Estatal de Quevedo</p>" +
            "<p>Todos los derechos reservados</p></div></div></body></html>";
    }
}
