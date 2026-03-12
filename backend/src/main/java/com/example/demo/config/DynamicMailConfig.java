package com.example.demo.config;

import com.example.demo.model.ConfiguracionCorreo;
import com.example.demo.repository.ConfiguracionCorreoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicMailConfig {

    private final ConfiguracionCorreoRepository configuracionRepo;

    /**
     * Obtiene el correo configurado desde la BD
     */
    public String obtenerCorreoConfiguracion() {
        ConfiguracionCorreo config = configuracionRepo
                .findByTipoAndActivo("EMAIL_FROM", true)
                .orElseThrow(() -> new RuntimeException(
                    "❌ No hay configuración de correo en la BD. Configura 'usuarios.configuracion_correo' primero."
                ));
        return config.getValor();
    }

    /**
     * Obtiene JavaMailSender dinámicamente desde BD
     */
    public JavaMailSender getJavaMailSender() {
        ConfiguracionCorreo config = configuracionRepo
                .findByTipoAndActivo("EMAIL_FROM", true)
                .orElseThrow(() -> new RuntimeException(
                    "❌ No hay configuración de correo en la BD. Configura 'usuarios.configuracion_correo' primero."
                ));

        if (config.getPassword() == null || config.getPassword().isEmpty()) {
            throw new RuntimeException("❌ Falta la contraseña/token en la configuración de correo");
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

        return mailSender;
    }
}

