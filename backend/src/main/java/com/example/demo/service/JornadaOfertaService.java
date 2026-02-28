package com.example.demo.service;

import com.example.demo.dto.JornadaOfertaDTO;
import com.example.demo.repository.JornadaOfertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JornadaOfertaService {

    private final JornadaOfertaRepository jornadaOfertaRepository;

    public List<JornadaOfertaDTO> obtenerTodas() {
        return jornadaOfertaRepository.findAll()
                .stream()
                .map(jor -> new JornadaOfertaDTO(
                        jor.getIdJornada(),
                        jor.getNombreJornada()
                ))
                .sorted((a, b) -> a.getNombreJornada()
                        .compareToIgnoreCase(b.getNombreJornada()))
                .collect(Collectors.toList());
    }
}
