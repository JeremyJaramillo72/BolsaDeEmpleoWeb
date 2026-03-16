package com.example.demo.service;

import com.example.demo.dto.AuditoriaPostulanteDTO;
import com.example.demo.dto.TrazabilidadPostulanteDTO;
import java.util.List;

public interface HistorialPostulanteService {
    List<AuditoriaPostulanteDTO> getPostulantesAuditoria();
    List<TrazabilidadPostulanteDTO> getHistorialByPerfil(Integer idPerfilAcademico);
}