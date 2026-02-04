package com.example.demo.service;

import com.example.demo.dto.UsuarioEmpresaDTO;
import com.example.demo.model.UsuarioEmpresa;

import java.util.List;

public interface IUsuarioEmpresaService {
    UsuarioEmpresaDTO  guardar(UsuarioEmpresaDTO usuarioEmpresaDTO);
    UsuarioEmpresaDTO editar(Long id, UsuarioEmpresaDTO usuarioEmpresaDTO);
    UsuarioEmpresa ObtenerIdEmpresa(Long id);
    UsuarioEmpresaDTO ObtenerIdUsuario(Long idUsuario);
    List<UsuarioEmpresaDTO> ObtenerTodo();
}
