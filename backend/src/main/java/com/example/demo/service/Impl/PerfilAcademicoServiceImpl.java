package com.example.demo.service.Impl;

import com.example.demo.repository.PerfilAcademicoRepository;
import com.example.demo.service.IPerfilAcademicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class PerfilAcademicoServiceImpl implements IPerfilAcademicoService {

    @Autowired
    private PerfilAcademicoRepository perfilAcademicoRepository;

    @Override
    @Transactional // 👈 Importante para asegurar la ejecución del procedimiento
    public void registrarNuevoTitulo(Long idUsuario, Integer idCarrera, LocalDate fecha, String senescyt, byte[] archivo) {
        // Llamamos al repositorio que ejecuta el procedimiento almacenado sp_registrar_perfil_academico
        perfilAcademicoRepository.registrarPerfilCompletoPro(
                idUsuario,
                idCarrera,
                fecha,
                senescyt,
                archivo
        );
    }
}