package com.example.demo.service.Impl;

import com.example.demo.dto.ActualizarAcademicoDTO;
import com.example.demo.repository.PerfilAcademicoRepository;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IPerfilAcademicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PerfilAcademicoServiceImpl implements IPerfilAcademicoService {

    private final PerfilAcademicoRepository perfilAcademicoRepository;
   private final AzureStorageConfig azureStorageConfig;
    @Override
    @Transactional
    public void actualizarAcademico(ActualizarAcademicoDTO dto) {
        String urlArchivo = null;
        try {
            if (dto.getArchivo() != null && !dto.getArchivo().isEmpty()) {
                urlArchivo = azureStorageConfig.subirDocumento(dto.getArchivo());
            }



            perfilAcademicoRepository.actualizarFormacionAcademica(
                    dto.getIdAcademico(),
                    dto.getIdCarrera(),
                    dto.getFechaGraduacion(),
                    dto.getNumeroSenescyt(),
                    urlArchivo
            );
        } catch (Exception e) {
            throw new RuntimeException("Error en la transacción de actualizar título: " + e.getMessage(), e);
        }
    }

}