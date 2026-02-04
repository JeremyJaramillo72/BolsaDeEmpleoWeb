package com.example.demo.service;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;

import java.util.List;

public interface IOfertaLaboralService {
    OfertaLaboral guardarOferta(OfertaLaboralDTO dto);

    List<OfertaLaboral> listarPorEmpresa(Long idEmpresa);

    List<OfertaLaboral> listarTodas();
}
