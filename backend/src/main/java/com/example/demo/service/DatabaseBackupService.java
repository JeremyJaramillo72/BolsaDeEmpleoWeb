package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class DatabaseBackupService {

    @Value("${backup.pgdump.path:pg_dump}")
    private String pgDumpPath;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${azure.storage.connection-string}")
    private String azureConnectionString;

    @Value("${azure.storage.container-name.backups}")
    private String containerNameBackups;

    public File generarBackupYSubirAzure() throws Exception {

        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String fileName = "bolsa_uteq_" + timeStamp + ".backup";

        String tempPath = Paths.get(System.getProperty("java.io.tmpdir"), fileName).toString();

        ProcessBuilder pb = new ProcessBuilder(
                pgDumpPath,
                "-U", dbUser,
                "-h", "bolsa-empleo-dbpg.postgres.database.azure.com",
                "-p", "5432",
                "-F", "c",
                "-f", tempPath,
                "Bolsa-Empleo-Azure"
        );

        pb.environment().put("PGPASSWORD", dbPassword);
        pb.environment().put("PGSSLMODE", "require");
        pb.redirectErrorStream(true);

        Process process = pb.start();

        java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(process.getInputStream())
        );
        StringBuilder outputMessage = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            outputMessage.append(line).append("\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Fallo pg_dump. Código: " + exitCode + ". Detalle:\n" + outputMessage.toString());
        }

        subirAAzure(tempPath, fileName);
        return new File(tempPath);
    }

    private void subirAAzure(String filePath, String fileName) {
        try {
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(azureConnectionString)
                    .buildClient();

            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
            if (!containerClient.exists()) {
                containerClient.create();
            }

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.uploadFromFile(filePath);
        } catch (Exception e) {
            throw new RuntimeException("Error subiendo el archivo a Azure: " + e.getMessage());
        }
    }
}