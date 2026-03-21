package com.example.demo.service;

public interface ISesionService {
    // ✅ Quitamos el parámetro "ip" — PostgreSQL lo captura con inet_client_addr()
    Long registrarLogin(Integer idSeguridad, String navegador, String dispositivo);

    void registrarLogout(Integer idSeguridad);
    void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta);
}