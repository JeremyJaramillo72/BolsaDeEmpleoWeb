package com.example.demo.service;

public interface ISesionService {
    // Ahora devuelve el ID de la sesión creada
    Long registrarLogin(Integer idSeguridad, String ip, String navegador, String dispositivo);

    void registrarLogout(Integer idSeguridad);
    void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta);
}