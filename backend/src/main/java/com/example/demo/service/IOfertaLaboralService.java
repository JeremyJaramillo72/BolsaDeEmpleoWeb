package com.example.demo.service;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.repository.OfertaLaboralRepository;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import com.example.demo.dto.IOfertaResumen;
import com.example.demo.repository.Views.IOfertaDetallada;

import java.util.List;

public interface IOfertaLaboralService {
    OfertaLaboral guardarOferta(OfertaLaboralDTO dto);

    List<IOfertaEmpresaDTO> listarPorEmpresa(Long idEmpresa);

    List<OfertaLaboral> listarTodas();
    List<IPostulanteOfertaDTO> obtenerPostulantes(Long idOferta);

    List<IOfertaResumen> listarPorEstado(String estadoOferta);

    void cambiarEstadoOferta(Long idOferta, String nuevoEstadoOferta);

    List<IOfertaDetallada> listarOfertasCompleto(Long idUsuario);

    String toggleFavorita(Integer idOferta, Long idUsuario);
}
