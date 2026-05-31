package com.example.demo.service;

import com.example.demo.dto.ActualizarUsuarioDTO;
import com.example.demo.dto.UsuarioDetalleDTO;
import com.example.demo.dto.UsuarioTablaDTO;
import com.example.demo.model.Usuario;
import java.util.List;

public interface IUsuarioService {
    // Definimos qué puede hacer nuestro servicio
    void registrarUsuarioNormal(Usuario usuario);
    void registrarEmpresaCompleta(Usuario usuario, String nombreEmp, String desc, String web, String ruc);
    void registrarUsuarioConAccesoBD(Usuario usuario);
    void registrarAdministrador(Usuario admin);
    void cambiarEstadoUsuario(Long idUsuario, String nuevoEstado); // (Este ya lo tenías, ¡perfecto!)

    // ==========================================
    // 🔥 NUEVOS MÉTODOS: GESTIÓN DE USUARIOS
    // ==========================================
    List<UsuarioTablaDTO> obtenerUsuariosGenerales();
    void cambiarContrasena(Long idUsuario, String claveActual, String nuevaClave);
    UsuarioDetalleDTO obtenerUsuarioPorId(Long idUsuario);
    void actualizarUsuario(Long idUsuario, ActualizarUsuarioDTO dto);
    void eliminarUsuario(Long idUsuario);

}