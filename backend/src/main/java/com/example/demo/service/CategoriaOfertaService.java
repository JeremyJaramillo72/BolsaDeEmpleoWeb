package com.example.demo.service;

import com.example.demo.dto.CategoriaOfertaDTO;
import com.example.demo.repository.CategoriaOfertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaOfertaService {

    private final CategoriaOfertaRepository categoriaOfertaRepository;

    public List<CategoriaOfertaDTO> obtenerTodas() {
        return categoriaOfertaRepository.findAll()
                .stream()
                .map(cat -> new CategoriaOfertaDTO(
                        cat.getIdCategoria(),
                        cat.getNombreCategoria()
                ))
                .sorted((a, b) -> a.getNombreCategoria()
                        .compareToIgnoreCase(b.getNombreCategoria()))
                .collect(Collectors.toList());
    }
}
