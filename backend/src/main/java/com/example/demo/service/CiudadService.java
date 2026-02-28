package com.example.demo.service;

import com.example.demo.dto.CiudadDTO;
import com.example.demo.repository.CiudadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CiudadService {

    private final CiudadRepository ciudadRepository;

    public List<CiudadDTO> obtenerTodas() {
        return ciudadRepository.findAll()
                .stream()
                .map(ciudad -> new CiudadDTO(
                        ciudad.getIdCiudad(),
                        ciudad.getNombreCiudad(),
                        // Provincia puede ser null si el registro está incompleto
                        ciudad.getProvincia() != null
                                ? ciudad.getProvincia().getNombreProvincia()
                                : null
                ))
                .sorted((a, b) -> a.getNombreCiudad()
                        .compareToIgnoreCase(b.getNombreCiudad()))
                .collect(Collectors.toList());
    }
}
