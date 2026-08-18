package com.example.demo.config;

import com.example.demo.model.ConfiguracionCorreo;
import com.example.demo.repository.ConfiguracionCorreoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicMailConfig {

    private final ConfiguracionCorreoRepository configuracionRepo;

    public String obtenerCorreoConfiguracion() {
        try {
            return configuracionRepo
                    .findByTipoAndActivo("EMAIL_FROM", true)
                    .map(ConfiguracionCorreo::getValor)
                    .orElse("soporte@bolsaempleo.com");
        } catch (Exception e) {
            return "soporte@bolsaempleo.com";
        }
    }

    public JavaMailSender getJavaMailSender() {
        try {
            ConfiguracionCorreo config = configuracionRepo
                    .findByTipoAndActivo("EMAIL_FROM", true)
                    .orElse(null);

            if (config == null || config.getPassword() == null || config.getPassword().isBlank()) {
                log.warn("Aviso: No hay configuracion activa de correo en BD o falta contrasena.");
                return null;
            }

            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost("smtp.gmail.com");
            mailSender.setPort(587);
            mailSender.setUsername(config.getValor());
            mailSender.setPassword(config.getPassword());

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.connectiontimeout", "3000");
            props.put("mail.smtp.timeout", "3000");
            props.put("mail.smtp.writetimeout", "3000");

            return mailSender;
        } catch (Exception e) {
            log.warn("No se pudo obtener JavaMailSender: {}", e.getMessage());
            return null;
        }
    }
}

