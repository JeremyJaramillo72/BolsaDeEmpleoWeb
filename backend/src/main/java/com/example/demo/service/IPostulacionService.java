package com.example.demo.service;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPostulacionService {
    void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception;
    void cancelarPostulacion(Integer idPostulacion);
    String obtenerUrlCV(Integer idPostulacion);
    PerfilPostulanteDTO obtenerPerfilDelCandidato(Long idPostulacion);
    public List<PostulanteResumenDTO> listarCandidatosPorOferta(Long idOferta);
    void evaluarItemIndividual(Long idPostulacion, ItemEvaluacionDTO dto);
    void evaluarPostulacionGeneral(Long idPostulacion, String estado, String mensaje);


}

