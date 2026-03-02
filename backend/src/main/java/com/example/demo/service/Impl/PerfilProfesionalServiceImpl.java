package com.example.demo.service.Impl;

import com.example.demo.dto.PerfilProfesionalDTO;
import com.example.demo.repository.Impl.PerfilProfesionalRepository;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IPerfilProfesionalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PerfilProfesionalServiceImpl implements IPerfilProfesionalService {
private final PerfilProfesionalRepository perfilProfesionalRepository;
    private final ObjectMapper objectMapper;
    private final AzureStorageConfig azureStorageConfig;



@Override
    public PerfilProfesionalDTO obtenerPerfil(Long idUsuario) {
        return perfilProfesionalRepository.obtenerPerfilCompleto(idUsuario);
    }
    @Override
    public void procesarYRegistrar(Long idUsuario, String tipoItem, Map<String, Object> datos, MultipartFile archivo) {
        try {
            String jsonDatos = objectMapper.writeValueAsString(datos);
            String urlArchivo = null;
            if (archivo != null && !archivo.isEmpty()) {
                urlArchivo = azureStorageConfig.subirDocumento(archivo);
            }

            perfilProfesionalRepository.registrarItemPerfil(idUsuario, tipoItem, jsonDatos, urlArchivo);

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el registro de " + tipoItem, e);
        }
    }
    @Override
    public void eliminarItem(Long idUsuario, String tipoItem, Integer idItem) {
        try {
            perfilProfesionalRepository.eliminarItemPerfil(idUsuario, tipoItem, idItem);
        } catch (Exception e) {
            throw new RuntimeException("error al intentar eliminar el registro de " + tipoItem, e);
        }
    }


}
