package com.example.demo.service;

import com.example.demo.dto.AuditoriaOfertaDTO;
import com.example.demo.dto.TrazabilidadOfertaDTO;

import java.util.List;

public interface HistorialOfertaService {

    // Método para llenar la tabla principal (con la última acción)
    List<AuditoriaOfertaDTO> getOfertasParaAuditoria();

    // Método para traer toda la línea de tiempo (Trazabilidad) de una oferta específica
    List<TrazabilidadOfertaDTO> getHistorialByOferta(Long idOferta);

}