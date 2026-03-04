package com.example.demo.service;

import com.example.demo.dto.PerfilProfesionalDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface IPerfilProfesionalService {

    PerfilProfesionalDTO obtenerPerfil(Long idUsuario);
    void procesarYRegistrar(Long idUsuario, String tipoItem, Map<String, Object> datos, MultipartFile archivo);
    void eliminarItem(Long idUsuario, String tipoItem, Integer idItem);
    Integer RegistrarCatalogoEmpresa(String nombreEmpresa,String ruc,Integer idcategoria);
    Integer RegistrarCargo(String cargo);
}
