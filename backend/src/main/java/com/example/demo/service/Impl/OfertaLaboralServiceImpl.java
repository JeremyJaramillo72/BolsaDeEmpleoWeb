package com.example.demo.service.Impl;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.IOfertaLaboralService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OfertaLaboralServiceImpl implements IOfertaLaboralService {
    private final OfertaLaboralRepository ofertaRepository;
    private  final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OfertaLaboral guardarOferta(OfertaLaboralDTO dto) {

        if (dto.getIdOferta() != null) {
            throw new UnsupportedOperationException("La edición no está implementada con este Stored Procedure.");
        }
        String habilidadesJson = "[]";
        try {
            if (dto.getHabilidades() != null && !dto.getHabilidades().isEmpty()) {

                habilidadesJson = objectMapper.writeValueAsString(dto.getHabilidades());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir habilidades a JSON", e);
        }

        Integer nuevoId = ofertaRepository.registrarOferta(
                dto.getIdEmpresa(),
                dto.getIdModalidad(),
                dto.getIdCategoria(),
                dto.getIdJornada(),
                dto.getIdCiudad(),
                dto.getTitulo(),
                dto.getDescripcion(),
                dto.getSalarioPromedio(),
                dto.getFechaInicio(),
                dto.getFechaCierre(),
                habilidadesJson
        );

        return ofertaRepository.findById(nuevoId)
                .orElseThrow(() -> new RuntimeException("Error al recuperar la oferta creada con ID: " + nuevoId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaLaboral> listarPorEmpresa(Long idEmpresa) {
        UsuarioEmpresa empresa = new UsuarioEmpresa();
        empresa.setIdEmpresa(idEmpresa);
        return ofertaRepository.findByEmpresa(empresa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaLaboral> listarTodas() {
        return ofertaRepository.findAll();
    }



    }
