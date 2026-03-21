package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.OffsetDateTime;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.util.*;
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
    private final com.zaxxer.hikari.HikariDataSource dataSource;

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


    public String restaurarEnNuevaBd(Long idBackup) throws Exception {
        String tempUnzippedPath = prepararBackupDesdeAzure(idBackup);

        Date fechaEjecucion = obtenerFechaBackup(idBackup);
        String fechaSegura = new SimpleDateFormat("yyyy_MM_dd_HHmm").format(fechaEjecucion);
        String nuevaBd = "bolsa_uteq_" + fechaSegura;

        try {
            jdbcTemplate.execute("CREATE DATABASE " + nuevaBd);
            System.out.println("Base de datos clonada creada: " + nuevaBd);

            ejecutarPgRestoreYPermisos(tempUnzippedPath, nuevaBd);
            return nuevaBd;
        } finally {
            if (tempUnzippedPath != null) Files.deleteIfExists(Paths.get(tempUnzippedPath));
        }
    }


    public String restaurarReemplazandoBdActual(Long idBackup) throws Exception {
        String currentDb = jdbcTemplate.queryForObject("SELECT current_database()", String.class);
        String tempUnzippedPath = prepararBackupDesdeAzure(idBackup);
        String masterJdbcUrl = "jdbc:postgresql://bolsa-empleo-dbpg.postgres.database.azure.com:5432/postgres?sslmode=require";

        try {
            try (java.sql.Connection conn = java.sql.DriverManager.getConnection(masterJdbcUrl, dbUser, dbPassword);
                 java.sql.Statement stmt = conn.createStatement()) {

                System.out.println("Bloqueando nuevas conexiones a: " + currentDb);
                stmt.execute("ALTER DATABASE \"" + currentDb + "\" ALLOW_CONNECTIONS false");

                System.out.println("Desconectando a todos los usuarios de: " + currentDb);
                stmt.execute("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '" + currentDb + "' AND pid <> pg_backend_pid()");

                Thread.sleep(1000);

                System.out.println("Borrando la base de datos actual...");
                stmt.execute("DROP DATABASE IF EXISTS \"" + currentDb + "\"");

                System.out.println("Creando la base de datos limpia...");
                stmt.execute("CREATE DATABASE \"" + currentDb + "\"");
            }

            System.out.println("Inyectando el respaldo en la base de datos limpia...");
            ejecutarPgRestoreYPermisos(tempUnzippedPath, currentDb);

            return "La base de datos actual ('" + currentDb + "') fue reemplazada exitosamente.";
        } finally {
            if (tempUnzippedPath != null) Files.deleteIfExists(Paths.get(tempUnzippedPath));
        }
    }


    private String prepararBackupDesdeAzure(Long idBackup) throws Exception {
        String sql = "SELECT url_azure FROM seguridad.historial_backups WHERE id_backup = ?";
        String urlAzure = jdbcTemplate.queryForObject(sql, String.class, idBackup);

        if (urlAzure == null || urlAzure.trim().isEmpty()) {
            throw new RuntimeException("Error crítico: Este respaldo no tiene URL de Azure.");
        }

        String rawZipFileName = urlAzure.substring(urlAzure.lastIndexOf('/') + 1);
        String zipFileName = java.net.URLDecoder.decode(rawZipFileName, java.nio.charset.StandardCharsets.UTF_8.name());

        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(azureConnectionString).buildClient();
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
        BlobClient blobClient = containerClient.getBlobClient(zipFileName);

        if (!blobClient.exists()) throw new RuntimeException("El backup no existe en Azure: " + zipFileName);

        blobClient.downloadToFile(tempZipPath, true);
        String tempUnzippedPath = descomprimirZip(tempZipPath);

        Files.deleteIfExists(Paths.get(tempZipPath));
        return tempUnzippedPath;
    }

    private void ejecutarPgRestoreYPermisos(String tempUnzippedPath, String targetDb) throws Exception {
        String tempGrantsPath = Paths.get(System.getProperty("java.io.tmpdir"), "grants_extraidos.sql").toString();

        try {
            ProcessBuilder pbData = new ProcessBuilder(
                    "pg_restore", "-U", dbUser,
                    "-h", "bolsa-empleo-dbpg.postgres.database.azure.com",
                    "-p", "5432", "-d", targetDb,
                    "--no-owner", "--no-privileges",
                    tempUnzippedPath
            );
            pbData.environment().put("PGPASSWORD", dbPassword);
            pbData.environment().put("PGSSLMODE", "require");
            pbData.redirectErrorStream(true);

            Process procesoData = pbData.start();
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(procesoData.getInputStream()))) {
                while (reader.readLine() != null) { }
            }
            procesoData.waitFor();

            ProcessBuilder pbGrants = new ProcessBuilder("pg_restore", "-s", "-f", tempGrantsPath, tempUnzippedPath);
            pbGrants.start().waitFor();

            if (Files.exists(Paths.get(tempGrantsPath))) {
                java.util.List<String> todasLasLineas = Files.readAllLines(Paths.get(tempGrantsPath), java.nio.charset.StandardCharsets.UTF_8);
                StringBuilder sqlSoloGrants = new StringBuilder();

                for (String linea : todasLasLineas) {
                    if (linea.trim().toUpperCase().startsWith("GRANT ") || linea.trim().toUpperCase().startsWith("ALTER DEFAULT PRIVILEGES")) {
                        sqlSoloGrants.append(linea).append("\n");
                    }
                }

                if (sqlSoloGrants.length() > 0) {
                    String jdbcUrl = "jdbc:postgresql://bolsa-empleo-dbpg.postgres.database.azure.com:5432/" + targetDb + "?sslmode=require";
                    try (java.sql.Connection conn = java.sql.DriverManager.getConnection(jdbcUrl, dbUser, dbPassword);
                         java.sql.Statement stmt = conn.createStatement()) {
                        stmt.execute(sqlSoloGrants.toString());
                    }
                }
            }
            System.out.println("✅ Restauración y permisos aplicados exitosamente.");

        } finally {
            Files.deleteIfExists(Paths.get(tempGrantsPath));
        }
    }

    private Date obtenerFechaBackup(Long idBackup) {
        String sql = "SELECT fecha_ejecucion FROM seguridad.historial_backups WHERE id_backup = ?";
        try {
            Date fecha = jdbcTemplate.queryForObject(sql, Date.class, idBackup);
            return fecha != null ? fecha : new Date();
        } catch (Exception e) {
            return new Date();
        }
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

            if (!blobClient.exists()) throw new RuntimeException("El archivo no existe en Azure: " + fileName);

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
            if (!containerClient.exists()) containerClient.create();

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.uploadFromFile(filePath, true);
            return blobClient.getBlobUrl();
        } catch (Exception e) {
            throw new RuntimeException("Error subiendo a Azure: " + e.getMessage());
        }
    }

    private String descomprimirZip(String zipFilePath) throws Exception {
        String unzippedFilePath = zipFilePath.replace(".zip", ".backup");
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new FileInputStream(zipFilePath))) {
            if (zis.getNextEntry() != null) {
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
    // 1. Método para listar los backups directo de la nube
    public List<Map<String, Object>> listarBackupsDirectoDeAzure() {
        List<Map<String, Object>> listaBackups = new ArrayList<>();

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(azureConnectionString)
                .buildClient();
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);

        for (BlobItem blobItem : containerClient.listBlobs()) {
            Map<String, Object> backupInfo = new HashMap<>();
            backupInfo.put("nombreArchivo", blobItem.getName());
            backupInfo.put("tamanoBytes", blobItem.getProperties().getContentLength());            backupInfo.put("fechaCreacion", blobItem.getProperties().getCreationTime().toString());
            listaBackups.add(backupInfo);
        }

        // Ordenamos para que los más recientes salgan primero
        listaBackups.sort((b1, b2) -> {
            OffsetDateTime f1 = OffsetDateTime.parse((String) b1.get("fechaCreacion"));
            OffsetDateTime f2 = OffsetDateTime.parse((String) b2.get("fechaCreacion"));
            return f2.compareTo(f1);
        });

        return listaBackups;
    }

    // 2. Método para restaurar en Modo Dios (Pasándole el nombre del archivo exacto)
    public String restaurarEmergenciaDesdeAzure(String zipFileName) throws Exception {
        System.out.println("🚨 INICIANDO PROTOCOLO DE EMERGENCIA. Restaurando: " + zipFileName);

        // A. Descargar y descomprimir directo de Azure
        String tempZipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName).toString();
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(azureConnectionString).buildClient();
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerNameBackups);
        BlobClient blobClient = containerClient.getBlobClient(zipFileName);

        if (!blobClient.exists()) throw new RuntimeException("El archivo no existe en Azure: " + zipFileName);

        blobClient.downloadToFile(tempZipPath, true);
        String tempUnzippedPath = descomprimirZip(tempZipPath);
        Files.deleteIfExists(Paths.get(tempZipPath));

        // B. El francotirador desde la Master
        // NOTA: Uso el nombre de BD que vi en tu código anterior: "Bolsa-Empleo-Azure"
        String nombreBaseDatos = "Bolsa-Empleo-Azure";
        String masterJdbcUrl = "jdbc:postgresql://bolsa-empleo-dbpg.postgres.database.azure.com:5432/postgres?sslmode=require";

        try {
            // Cerramos HikariCP para soltar la base corrupta
            if (dataSource != null && !dataSource.isClosed()) {
                dataSource.close();
            }

            try (java.sql.Connection conn = java.sql.DriverManager.getConnection(masterJdbcUrl, dbUser, dbPassword);
                 java.sql.Statement stmt = conn.createStatement()) {

                System.out.println("Limpiando procesos zombis de: " + nombreBaseDatos);
                stmt.execute("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '" + nombreBaseDatos + "' AND pid <> pg_backend_pid()");
                Thread.sleep(2000);

                System.out.println("Eliminando BD corrupta y recreando...");
                stmt.execute("DROP DATABASE IF EXISTS \"" + nombreBaseDatos + "\"");
                stmt.execute("CREATE DATABASE \"" + nombreBaseDatos + "\"");
            }

            // C. Inyectar los datos limpios
            System.out.println("Inyectando el respaldo de emergencia...");
            ejecutarPgRestoreYPermisos(tempUnzippedPath, nombreBaseDatos);

            return "¡La base de datos resucitó con éxito! El sistema debe reiniciarse.";
        } finally {
            if (tempUnzippedPath != null) Files.deleteIfExists(Paths.get(tempUnzippedPath));
        }
    }
}