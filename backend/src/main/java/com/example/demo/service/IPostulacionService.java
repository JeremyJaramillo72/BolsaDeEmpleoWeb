package com.example.demo.service;

import org.springframework.web.multipart.MultipartFile;

public interface IPostulacionService {
    void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception;
    void cancelarPostulacion(Integer idPostulacion);
    String obtenerUrlCV(Integer idPostulacion);
}

