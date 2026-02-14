package com.example.demo.service;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailService {

    private JavaMailSender mailSender;

    public void enviarCodigo(String destino, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Código de Verificación");
        mensaje.setText("Tu código es: " + codigo);
        mailSender.send(mensaje);
    }
    public void enviarCorreoValidacion(String destinatario, String nombreEmpresa, String estado) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom("kespanav@uteq.edu.ec");
        mensaje.setTo(destinatario);
        mensaje.setSubject("Respuesta de Solicitud - Bolsa de Empleos");

        String texto = "Hola " + nombreEmpresa + ",\n\n"
                + "Le informamos que el estado de su solicitud de registro de empresa ha sido actualizado a: " + estado + ".\n\n";

        if (estado.equalsIgnoreCase("Aprobado")) {
            texto += "¡Felicidades! Ya puede iniciar sesión en la plataforma y publicar sus ofertas de trabajo.\n";
        } else if (estado.equalsIgnoreCase("Rechazado")) {
            texto += "Lo sentimos, su cuenta no cumple con los requisitos actuales. Por favor, póngase en contacto con el administrador para más detalles.\n";
        }

        texto += "\nAtentamente,\nEl equipo de la Bolsa de Empleos.";

        mensaje.setText(texto);
        mailSender.send(mensaje);
    }
    public void enviarCorreoCuentaNoAprobada(String destinatario, String nombreEmpresa, String estadoActual) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom("kespanav@uteq.edu.ec");
        mensaje.setTo(destinatario);
        mensaje.setSubject("Aviso de Inicio de Sesión - Bolsa de Empleos");

        String texto = "hola " + nombreEmpresa + ",\n\n"
                + "hemos detectado un intento de inicio de sesión en tu cuenta.\n\n"
                + "te recordamos que tu perfil actualmente se encuentra en estado: " + estadoActual.toUpperCase() + ".\n";

        if (estadoActual.equalsIgnoreCase("Pendiente")) {
            texto += "nuestros administradores aún están revisando tu información. te notificaremos en cuanto seas aprobado para que puedas acceder.\n";
        } else {
            texto += "por favor, comunícate con soporte para más detalles sobre el estado de tu cuenta.\n";
        }

        texto += "\natentamente,\nel equipo de la bolsa de empleos.";

        mensaje.setText(texto);
        mailSender.send(mensaje);
    }
}