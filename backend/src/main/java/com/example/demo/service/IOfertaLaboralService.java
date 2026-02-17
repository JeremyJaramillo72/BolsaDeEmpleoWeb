package com.example.demo.service;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;

import java.util.List;

public interface IOfertaLaboralService {
    OfertaLaboral guardarOferta(OfertaLaboralDTO dto);

    List<IOfertaEmpresaDTO> listarPorEmpresa(Long idEmpresa);

    List<OfertaLaboral> listarTodas();
    List<IPostulanteOfertaDTO> obtenerPostulantes(Long idOferta);
}
