package com.example.demo.service;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPerfilBaseDTO;
import com.example.demo.dto.ResumenSeccionDTO;
import com.example.demo.repository.Views.IMisPostulaciones;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPostulacionService {
    void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception;
    void cancelarPostulacion(Integer idPostulacion);
    String obtenerUrlCV(Integer idPostulacion);
    PerfilPostulanteDTO obtenerPerfilDelCandidato(Long idPostulacion);
    List<PostulanteResumenDTO> listarCandidatosPorOferta(Long idOferta);
    void evaluarItemIndividual(Long idPostulacion, ItemEvaluacionDTO dto);
    void evaluarPostulacionGeneral(Long idPostulacion, String estado, String mensaje);
    List<IMisPostulaciones> listarMisPostulaciones(Long idUsuario);
    ResumenPerfilBaseDTO obtenerPerfilBase(Long idPostulacion);
    List<ResumenSeccionDTO> obtenerFormacion(Long idPostulacion);
    List<ResumenSeccionDTO> obtenerExperiencia(Long idPostulacion);
    List<ResumenSeccionDTO> obtenerCursos(Long idPostulacion);
    List<ResumenSeccionDTO> obtenerIdiomas(Long idPostulacion);
}
