package com.example.demo.service;

import com.example.demo.dto.ActualizarExperienciaLaboralDTO;
import com.example.demo.dto.ActualizarPerfilDTO;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

public interface IExpLaboralService {
    void registrarExpLaboral(
            Long idUsuario,
            Integer idCargo,
            Integer idEmpresaCatalogo,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String descripcion,
            String ubicacion,
            MultipartFile archivo
    );

    void actualizarExpLaboral(ActualizarExperienciaLaboralDTO dto );
}

