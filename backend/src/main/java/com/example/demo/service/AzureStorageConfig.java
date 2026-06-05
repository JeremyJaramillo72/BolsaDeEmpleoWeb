package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Fachada de compatibilidad: delega en {@link AzureBlobStorageService}.
 */
@Service
public class AzureStorageConfig {

    private final AzureBlobStorageService azureBlobStorageService;

    public AzureStorageConfig(AzureBlobStorageService azureBlobStorageService) {
        this.azureBlobStorageService = azureBlobStorageService;
    }

    public String subirDocumento(MultipartFile archivo) throws IOException {
        return azureBlobStorageService.subirDocumento(archivo);
    }

    public String resolverUrlAcceso(String urlGuardada) {
        return azureBlobStorageService.resolverUrlAcceso(urlGuardada);
    }
}
