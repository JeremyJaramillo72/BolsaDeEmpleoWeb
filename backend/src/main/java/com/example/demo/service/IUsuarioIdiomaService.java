package com.example.demo.service;

import com.example.demo.dto.ActualizarIdiomaDTO;
import org.springframework.stereotype.Service;


public interface IUsuarioIdiomaService {
    void actualizarIdioma(ActualizarIdiomaDTO dto);
}