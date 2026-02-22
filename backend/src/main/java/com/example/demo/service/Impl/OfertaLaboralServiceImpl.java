package com.example.demo.service.Impl;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.repository.Views.IOfertaDetallada;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import com.example.demo.service.IOfertaLaboralService;
import lombok.RequiredArgsConstructor;

import com.example.demo.dto.IOfertaResumen;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;


import java.util.List;

@Service
@RequiredArgsConstructor
public class OfertaLaboralServiceImpl implements IOfertaLaboralService {
    private final OfertaLaboralRepository ofertaRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OfertaLaboral guardarOferta(OfertaLaboralDTO dto) {


        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("el título de la oferta es obligatorio");
        }
        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            throw new IllegalArgumentException("la descripción es obligatoria");
        }
        if (dto.getIdCiudad() == null || dto.getIdCiudad() == 0) {
            throw new IllegalArgumentException("debe seleccionar una provincia y una ciudad válida");
        }
        if (dto.getCantidadVacantes() == null || dto.getCantidadVacantes() < 1) {
            throw new IllegalArgumentException("debe haber al menos 1 vacante");
        }


        if (dto.getSalarioMin() != null && dto.getSalarioMax() != null) {
            if (dto.getSalarioMin().compareTo(dto.getSalarioMax()) > 0) {
                throw new IllegalArgumentException("el salario mínimo no puede ser mayor al salario máximo");
            }
        }
        if (dto.getFechaInicio() != null && dto.getFechaCierre() != null) {
            if (dto.getFechaCierre().isBefore(dto.getFechaInicio())) {
                throw new IllegalArgumentException("la fecha de cierre no puede ser anterior a la fecha de inicio");
            }
        }


        String habilidadesJson = "[]";
        try {
            if (dto.getHabilidades() != null && !dto.getHabilidades().isEmpty()) {
                habilidadesJson = objectMapper.writeValueAsString(dto.getHabilidades());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir habilidades a json", e);
        }

        String requisitosJson = "[]";
        try {
            if (dto.getRequisitos_manuales() != null && !dto.getRequisitos_manuales().isEmpty()) {
                requisitosJson = objectMapper.writeValueAsString(dto.getRequisitos_manuales());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir requisitos manuales a json", e);
        }


        if (dto.getIdOferta() == null || dto.getIdOferta() == 0) {
            ofertaRepository.registrarOferta(
                    dto.getIdEmpresa(),
                    dto.getIdModalidad(),
                    dto.getIdCategoria(),
                    dto.getIdJornada(),
                    dto.getIdCiudad(),
                    dto.getTitulo(),
                    dto.getDescripcion(),
                    dto.getSalarioMin(),
                    dto.getSalarioMax(),
                    dto.getCantidadVacantes(),
                    dto.getExperienciaMinima(),
                    dto.getFechaInicio() != null ? dto.getFechaInicio() : java.time.LocalDate.now(),
                    dto.getFechaCierre(),
                    habilidadesJson,
                    requisitosJson
            );
        } else {
            ofertaRepository.actualizarOferta(
                    dto.getIdOferta(),
                    dto.getIdModalidad(),
                    dto.getIdCategoria(),
                    dto.getIdJornada(),
                    dto.getIdCiudad(),
                    dto.getTitulo(),
                    dto.getDescripcion(),
                    dto.getSalarioMin(),
                    dto.getSalarioMax(),
                    dto.getCantidadVacantes(),
                    dto.getExperienciaMinima(),
                    dto.getEstadoOferta(),
                    dto.getFechaCierre(),
                    habilidadesJson,
                    requisitosJson
            );
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IOfertaEmpresaDTO> listarPorEmpresa(Long idEmpresa) {
        return ofertaRepository.obtenerOfertasPorEmpresa(idEmpresa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaLaboral> listarTodas() {
        return ofertaRepository.findAll();
    }

    @Override
    public List<IPostulanteOfertaDTO> obtenerPostulantes(Long idOferta) {
        return ofertaRepository.obtenerPostulantesPorOferta(idOferta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IOfertaResumen> listarPorEstado(String estadoOferta) {
        return ofertaRepository.listarPorEstadoSP(estadoOferta);
    }

    @Override
    @Transactional
    public void cambiarEstadoOferta(Long idOferta, String nuevoEstado) {

        ofertaRepository.actualizarEstadoDirecto(idOferta, nuevoEstado);
    }





    @Override
    @Transactional(readOnly = true)
    public List<IOfertaDetallada> listarOfertasCompleto(Long idUsuario) {
        return ofertaRepository.listarOfertasCompleto(idUsuario);
    }

    @Override
    @Transactional
    public String toggleFavorita(Integer idOferta, Long idUsuario) {
        return ofertaRepository.toggleFavorita(idOferta, idUsuario);
    }
}
