package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.IOException;
import java.util.UUID;
@Service
public class AzureStorageConfig {
    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    public String subirDocumento(MultipartFile archivo) throws IOException {
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        String nombreUnico = UUID.randomUUID().toString() + extension;

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(nombreUnico);

        // 1. Subimos el archivo a Azure
        blobClient.upload(archivo.getInputStream(), archivo.getSize(), true);

        // 2. ¡EL SECRETO PARA LOS PDF! Le decimos a Azure qué tipo de archivo es
        BlobHttpHeaders headers = new BlobHttpHeaders();
        // Obtiene automáticamente "application/pdf" desde tu Angular
        headers.setContentType(archivo.getContentType());
        blobClient.setHttpHeaders(headers);

        return blobClient.getBlobUrl();
    }
}
