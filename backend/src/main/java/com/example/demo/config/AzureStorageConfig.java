package com.example.demo.config;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public class AzureStorageConfig {
    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    public String subirDocumento(MultipartFile archivo) throws IOException {

        // 1. Extraemos el nombre original y le ponemos un código único para que no se sobreescriban
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        String nombreUnico = UUID.randomUUID().toString() + extension;

        // 2. Nos conectamos a Azure
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        // 3. Apuntamos a la carpeta (contenedor) y preparamos el nuevo archivo
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(nombreUnico);

        // 4. ¡Subimos el archivo a la nube! (el 'true' permite sobreescribir si por casualidad hay uno igual)
        blobClient.upload(archivo.getInputStream(), archivo.getSize(), true);

        // 5. Retornamos la URL pública directa para guardarla en la Base de Datos
        return blobClient.getBlobUrl();
    }
}
