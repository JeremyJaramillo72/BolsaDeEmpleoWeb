package com.example.demo.service;

import com.example.demo.model.Usuario;

public interface IUsuarioService {
    // Definimos qué puede hacer nuestro servicio
    void registrarUsuarioNormal(Usuario usuario);
    void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc);
    void registrarUsuarioConAccesoBD(Usuario usuario);
}