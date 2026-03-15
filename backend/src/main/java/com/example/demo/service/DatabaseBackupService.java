package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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

        // 1. Nombres de Archivos
        String timeStamp = new SimpleDateFormat("dd-MMM-yyyy_hh-mm-a").format(new Date());
        String dbFileName = "Bolsa_Uteq_" + timeStamp + ".backup";
        String zipFileName = "Backup_Bolsa_" + timeStamp + ".zip";

        String tempDbPath = Paths.get(System.getProperty("java.io.tmpdir"), dbFileName).toString();
        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();

        // 2. Ejecutar pg_dump
        ProcessBuilder pb = new ProcessBuilder(
                pgDumpPath,
                "-U", dbUser,
                "-h", "bolsa-empleo-dbpg.postgres.database.azure.com",
                "-p", "5432",
                "-F", "c",
                "-f", tempDbPath,
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

        // 🟢 3. MAGIA: EMPAQUETAR EL .BACKUP DENTRO DE UN .ZIP 🟢
        empaquetarEnZip(tempDbPath, tempZipPath, dbFileName);

        // 4. Subimos el .ZIP a Azure (en vez del .backup suelto)
        subirAAzure(tempZipPath, zipFileName);

        // 5. Limpieza: Borramos el .backup original para no dejar basura en el servidor
        Files.deleteIfExists(Paths.get(tempDbPath));


        return new File(tempZipPath);
    }

    private void empaquetarEnZip(String sourceFilePath, String zipFilePath, String fileNameInsideZip) throws Exception {
        try (FileOutputStream fos = new FileOutputStream(zipFilePath);
             ZipOutputStream zos = new ZipOutputStream(fos);
             FileInputStream fis = new FileInputStream(sourceFilePath)) {

            ZipEntry zipEntry = new ZipEntry(fileNameInsideZip);
            zos.putNextEntry(zipEntry);

            byte[] buffer = new byte[1024];
            int length;
            while ((length = fis.read(buffer)) >= 0) {
                zos.write(buffer, 0, length);
            }
            zos.closeEntry();
        }
    }

    public ByteArrayResource descargarDeAzure(String fileName) {
        try {
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(azureConnectionString)
                    .buildClient();

            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
            BlobClient blobClient = containerClient.getBlobClient(fileName);

            if (!blobClient.exists()) {
                throw new RuntimeException("El archivo no existe en Azure: " + fileName);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            blobClient.downloadStream(outputStream);

            return new ByteArrayResource(outputStream.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Error descargando desde Azure: " + e.getMessage());
        }
    }

        private void subirAAzure (String filePath, String fileName){
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
                throw new RuntimeException("Error subiendo a Azure: " + e.getMessage());
            }
        }

}