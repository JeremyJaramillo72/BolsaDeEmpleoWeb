package com.example.demo.service.Impl;

import com.example.demo.dto.EnlazarRolDTO;
import com.example.demo.repository.RolesRepository;
import com.example.demo.service.RolService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private ObjectMapper objectMapper; // Convierte objetos Java a JSON

    @Override
    public String enlazarPermisosUi(EnlazarRolDTO dto) {
        try {
            // Convertimos el DTO a un String JSON: {"idRolBd":"...", "idRolAplicativo": 2, "permisosUi":"..."}
            String jsonString = objectMapper.writeValueAsString(dto);

            // Llamamos al repository
            return rolesRepository.enlazarPermisosRolBd(jsonString);

        } catch (Exception e) {
            throw new RuntimeException("Error al convertir DTO a JSON o ejecutar función", e);
        }
    }
}