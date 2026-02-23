package com.example.demo.service;

import com.example.demo.dto.PerfilPostulanteDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IPostulacionService {
    void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception;
    void cancelarPostulacion(Integer idPostulacion);
    String obtenerUrlCV(Integer idPostulacion);
    PerfilPostulanteDTO obtenerPerfilDelCandidato(Long idPostulacion);

}

