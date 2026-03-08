package com.example.demo.service;

public interface ISesionService {
    void registrarLogin(Integer idSeguridad, String ip, String navegador, String dispositivo);
    void registrarLogout(Integer idSeguridad);
    void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta);
}