package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.repository.Views.IOfertaDetallada;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IOfertaFisicaAdminDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IOfertaLaboralService {
    OfertaLaboral guardarOferta(OfertaLaboralDTO dto);
    List<IOfertaEmpresaDTO> listarPorEmpresa(Long idEmpresa);
    List<OfertaLaboral> listarTodas();
    List<IPostulanteOfertaDTO> obtenerPostulantes(Long idOferta);
    List<IOfertaResumen> listarPorEstado(String estadoOferta);
    void cambiarEstadoOferta(Long idOferta, String nuevoEstadoOferta);
    List<IOfertaDetallada> listarOfertasCompleto(Long idUsuario);
    String toggleFavorita(Integer idOferta, Long idUsuario);
    OfertaExtraInfoDTO obtenerExtraInfo(Integer idOferta);
    Map<Integer, Long> contarPostulantesPorOfertas(List<Integer> ids);
    OfertaLaboral guardarOfertaFisica(OfertaLaboralDTO dto, MultipartFile archivoOficio, Long idUsuarioAdmin);
    List<IOfertaFisicaAdminDTO> listarOfertasFisicasAdmin();
    Long crearEmpresaPorAdmin(NuevaEmpresaAdminDTO dto);
}
