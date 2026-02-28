package com.example.demo.service;

import com.example.demo.dto.ModalidadOfertaDTO;
import com.example.demo.repository.ModalidadOfertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModalidadOfertaService {

    private final ModalidadOfertaRepository modalidadOfertaRepository;

    public List<ModalidadOfertaDTO> obtenerTodas() {
        return modalidadOfertaRepository.findAll()
                .stream()
                .map(mod -> new ModalidadOfertaDTO(
                        mod.getIdModalidad(),
                        mod.getNombreModalidad()
                ))
                .sorted((a, b) -> a.getNombreModalidad()
                        .compareToIgnoreCase(b.getNombreModalidad()))
                .collect(Collectors.toList());
    }
}