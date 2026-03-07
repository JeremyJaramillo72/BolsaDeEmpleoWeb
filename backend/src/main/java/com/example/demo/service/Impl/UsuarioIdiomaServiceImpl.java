package com.example.demo.service.Impl;

import com.example.demo.dto.ActualizarIdiomaDTO;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IUsuarioIdiomaService;
import com.example.demo.repository.UsuarioIdiomaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UsuarioIdiomaServiceImpl implements IUsuarioIdiomaService {
    private final  UsuarioIdiomaRepository usuarioIdiomaRepository;
    private final AzureStorageConfig azureStorageConfig;

    @Override
    @Transactional
    public void actualizarIdioma(ActualizarIdiomaDTO dto) {
        String urlArchivo = null;
        try {
            if (dto.getArchivo() != null && !dto.getArchivo().isEmpty()) {
                urlArchivo = azureStorageConfig.subirDocumento(dto.getArchivo());
            }

            usuarioIdiomaRepository.actualizarIdioma(
                    dto.getIdUsuarioIdioma(),
                    dto.getIdIdioma(),
                    dto.getNivel(),
                    urlArchivo
            );
        } catch (Exception e) {
            throw new RuntimeException("Error en la transacción de actualizar idioma: " + e.getMessage(), e);
        }
    }
}