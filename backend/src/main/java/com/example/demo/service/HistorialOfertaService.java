package com.example.demo.service;

import com.example.demo.dto.AuditoriaOfertaDTO;
import com.example.demo.model.HistorialOferta;

import java.util.List;

public interface HistorialOfertaService {

    // Método para llenar la tabla principal
    List<AuditoriaOfertaDTO> getOfertasParaAuditoria();

    // Método para traer toda la línea de tiempo de una oferta específica
    List<HistorialOferta> getHistorialByOferta(Long idOferta);

}