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
    public String restaurarEnNuevaBd(Long idBackup) throws Exception {

        // 1. Ir a la base de datos para obtener el nombre del archivo ZIP y la fecha del backup
        String sql = "SELECT url_azure, fecha_ejecucion FROM seguridad.historial_backups WHERE id_backup = ?";
        java.util.Map<String, Object> backupRecord = jdbcTemplate.queryForMap(sql, idBackup);

        String urlAzure = (String) backupRecord.get("url_azure");
        Date fechaEjecucion = (Date) backupRecord.get("fecha_ejecucion");

        // Extraer solo el nombre del archivo si la URL viene completa
        String zipFileName = urlAzure.substring(urlAzure.lastIndexOf('/') + 1);

        // 2. Generar el nombre AUTOMÁTICO de la nueva Base de Datos (Postgres exige minúsculas y sin guiones medios)
        String fechaSegura = new SimpleDateFormat("yyyy_MM_dd_HHmm").format(fechaEjecucion);
        String nuevaBd = "bolsa_uteq_" + fechaSegura;

        // Rutas temporales en el servidor
        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();
        String tempUnzippedPath = null;

        try {
            // 3. Descargar el archivo .ZIP desde Azure al disco duro
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(azureConnectionString).buildClient();
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
            BlobClient blobClient = containerClient.getBlobClient(zipFileName);

            if (!blobClient.exists()) {
                throw new RuntimeException("El backup no existe en la nube: " + zipFileName);
            }
            blobClient.downloadToFile(tempZipPath, true); // true = sobreescribir si ya existe

            // 4. DESCOMPRIMIR EL .ZIP para sacar el archivo .backup (pg_restore no lee zips)
            tempUnzippedPath = descomprimirZip(tempZipPath);

            // 5. Crear la nueva base de datos vacía
            jdbcTemplate.execute("CREATE DATABASE " + nuevaBd);
            System.out.println("Base de datos clonada creada: " + nuevaBd);

            ProcessBuilder pb = new ProcessBuilder(
                    "pg_restore",
                    "-U", dbUser,
                    "-h", "bolsa-empleo-dbpg.postgres.database.azure.com",
                    "-p", "5432",
                    "-d", nuevaBd,
                    "--no-owner",            // Evita cambiar el dueño de las tablas
                    // 🔥 QUITAMOS --no-privileges PARA QUE SÍ RESTAURE TUS ROLES Y PERMISOS
                    "--role=" + dbUser,
                    tempUnzippedPath
            );

            // Inyectar contraseña para automatizar
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.environment().put("PGSSLMODE", "require");
            pb.redirectErrorStream(true);

            System.out.println("Iniciando inyección de datos con pg_restore en " + nuevaBd + "...");
            Process proceso = pb.start();

            // Leer logs de la consola por si Postgres se queja
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(proceso.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("pg_restore: " + line);
            }

            int exitCode = proceso.waitFor();

            if (exitCode > 1) {
                throw new RuntimeException("Fallo pg_restore. Código fatal: " + exitCode);
            }

            return nuevaBd;

        } finally {
            // 7. LIMPIEZA EXTREMA: Borramos el .zip y el .backup del servidor temporal
            Files.deleteIfExists(Paths.get(tempZipPath));
            if (tempUnzippedPath != null) {
                Files.deleteIfExists(Paths.get(tempUnzippedPath));
            }
            System.out.println("Archivos temporales limpiados del servidor.");
        }
    }

    // 🔥 MÉTODO AYUDANTE: Extrae el .backup del .zip
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