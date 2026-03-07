package com.example.demo.service;

import com.example.demo.dto.ActualizarAcademicoDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

public interface IPerfilAcademicoService {
    void actualizarAcademico(ActualizarAcademicoDTO dto);
}