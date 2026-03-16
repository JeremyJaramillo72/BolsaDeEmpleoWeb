package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
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

    private final JdbcTemplate jdbcTemplate;

    
    public static class BackupResult {
        private File archivoLocal;
        private String urlAzure;

        public BackupResult(File archivoLocal, String urlAzure) {
            this.archivoLocal = archivoLocal;
            this.urlAzure = urlAzure;
        }

        public File getArchivoLocal() { return archivoLocal; }
        public String getUrlAzure() { return urlAzure; }
    }


    public BackupResult generarBackupYSubirAzure() throws Exception {

        String timeStamp = new SimpleDateFormat("dd-MMM-yyyy_hh-mm-a").format(new Date());
        String dbFileName = "Bolsa_Uteq_" + timeStamp + ".backup";
        String zipFileName = "Backup_Bolsa_" + timeStamp + ".zip";

        String tempDbPath = Paths.get(System.getProperty("java.io.tmpdir"), dbFileName).toString();
        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();

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

        empaquetarEnZip(tempDbPath, tempZipPath, dbFileName);
        String urlGeneradaAzure = subirAAzure(tempZipPath, zipFileName);
        Files.deleteIfExists(Paths.get(tempDbPath));
        return new BackupResult(new File(tempZipPath), urlGeneradaAzure);
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

    public ByteArrayResource descargarDeAzure(String encodedFileName) {
        try {
            String fileName = URLDecoder.decode(encodedFileName, StandardCharsets.UTF_8.name());
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


    private String subirAAzure(String filePath, String fileName) {
        try {
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(azureConnectionString)
                    .buildClient();

            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
            if (!containerClient.exists()) {
                containerClient.create();
            }

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.uploadFromFile(filePath, true);

            return blobClient.getBlobUrl();
        } catch (Exception e) {
            throw new RuntimeException("Error subiendo a Azure: " + e.getMessage());
        }
    }

    public String restaurarEnNuevaBd(Long idBackup) throws Exception {

        String sql = "SELECT url_azure, fecha_ejecucion FROM seguridad.historial_backups WHERE id_backup = ?";
        java.util.Map<String, Object> backupRecord = jdbcTemplate.queryForMap(sql, idBackup);

        String urlAzure = (String) backupRecord.get("url_azure");
        if (urlAzure == null || urlAzure.trim().isEmpty()) {
            throw new RuntimeException("Error crítico: Este respaldo no tiene URL de Azure.");
        }

        Date fechaEjecucion = (Date) backupRecord.get("fecha_ejecucion");
        if (fechaEjecucion == null) fechaEjecucion = new Date();

        String rawZipFileName = urlAzure.substring(urlAzure.lastIndexOf('/') + 1);
        String zipFileName = java.net.URLDecoder.decode(rawZipFileName, java.nio.charset.StandardCharsets.UTF_8.name());

        String fechaSegura = new SimpleDateFormat("yyyy_MM_dd_HHmm").format(fechaEjecucion);
        String nuevaBd = "bolsa_uteq_" + fechaSegura;

        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();
        String tempUnzippedPath = null;
        String tempGrantsPath = Paths.get(System.getProperty("java.io.tmpdir"), "grants_extraidos.sql").toString();

        try {
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(azureConnectionString).buildClient();
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
            BlobClient blobClient = containerClient.getBlobClient(zipFileName);

            if (!blobClient.exists()) throw new RuntimeException("El backup no existe en Azure: " + zipFileName);
            blobClient.downloadToFile(tempZipPath, true);

            tempUnzippedPath = descomprimirZip(tempZipPath);

            jdbcTemplate.execute("CREATE DATABASE " + nuevaBd);
            System.out.println("Base de datos clonada creada: " + nuevaBd);

            // 🟢 FASE 1: RESTAURAR DATOS Y ESQUEMA (SIN DUEÑOS NI PERMISOS)
            ProcessBuilder pbData = new ProcessBuilder(
                    "pg_restore", "-U", dbUser,
                    "-h", "bolsa-empleo-dbpg.postgres.database.azure.com",
                    "-p", "5432", "-d", nuevaBd,
                    "--no-owner", "--no-privileges",
                    tempUnzippedPath
            );
            pbData.environment().put("PGPASSWORD", dbPassword);
            pbData.environment().put("PGSSLMODE", "require");
            pbData.redirectErrorStream(true);

            System.out.println("Iniciando Fase 1: Inyección de datos...");
            Process procesoData = pbData.start();
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(procesoData.getInputStream()))) {
                while (reader.readLine() != null) { }
            }
            procesoData.waitFor();

            // 🟢 FASE 2: EXTRAER Y FILTRAR PERMISOS (EL BYPASS)
            System.out.println("Iniciando Fase 2: Extracción de esquema para obtener GRANTs...");

            ProcessBuilder pbGrants = new ProcessBuilder(
                    "pg_restore", "-s", "-f", tempGrantsPath, tempUnzippedPath
            );
            pbGrants.start().waitFor();

            if (Files.exists(Paths.get(tempGrantsPath))) {
                System.out.println("Filtrando y aplicando permisos limpios...");

                java.util.List<String> todasLasLineas = Files.readAllLines(Paths.get(tempGrantsPath), java.nio.charset.StandardCharsets.UTF_8);
                StringBuilder sqlSoloGrants = new StringBuilder();

                for (String linea : todasLasLineas) {
                    String lineaTrim = linea.trim().toUpperCase();
                    if (lineaTrim.startsWith("GRANT ") || lineaTrim.startsWith("ALTER DEFAULT PRIVILEGES")) {
                        sqlSoloGrants.append(linea).append("\n");
                    }
                }

                if (sqlSoloGrants.length() > 0) {
                    String jdbcUrl = "jdbc:postgresql://bolsa-empleo-dbpg.postgres.database.azure.com:5432/" + nuevaBd + "?sslmode=require";
                    try (java.sql.Connection conn = java.sql.DriverManager.getConnection(jdbcUrl, dbUser, dbPassword);
                         java.sql.Statement stmt = conn.createStatement()) {
                        stmt.execute(sqlSoloGrants.toString());
                        System.out.println("✅ Todos los permisos (GRANTs) han sido aplicados con éxito.");
                    }
                }
            }

            System.out.println("¡Restauración Completa!");
            return nuevaBd;

        } finally {
            Files.deleteIfExists(Paths.get(tempZipPath));
            Files.deleteIfExists(Paths.get(tempGrantsPath));
            if (tempUnzippedPath != null) Files.deleteIfExists(Paths.get(tempUnzippedPath));
        }
    }

    private String descomprimirZip(String zipFilePath) throws Exception {
        String unzippedFilePath = zipFilePath.replace(".zip", ".backup");

        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new FileInputStream(zipFilePath))) {
            java.util.zip.ZipEntry zipEntry = zis.getNextEntry();

            if (zipEntry != null) {
                try (FileOutputStream fos = new FileOutputStream(unzippedFilePath)) {
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                }
            } else {
                throw new RuntimeException("El archivo ZIP de Azure estaba vacío.");
            }
        }
        return unzippedFilePath;
    }
}