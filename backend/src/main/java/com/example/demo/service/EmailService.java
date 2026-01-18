package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ASEGÚRATE DE QUE ESTE NOMBRE SEA EXACTO: enviarCodigo
    public void enviarCodigo(String destino, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Código de Verificación");
        mensaje.setText("Tu código es: " + codigo);
        mailSender.send(mensaje);
    }
}