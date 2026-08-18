package com.example.demo.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

/**
 * Subida de PDFs/documentos a Azure Blob Storage.
 * En BD solo se guarda la URL devuelta por {@link #subirDocumento(MultipartFile)}.
 */
@Service
public class AzureBlobStorageService {

    private static final Logger log = LoggerFactory.getLogger(AzureBlobStorageService.class);
    private static final String PLACEHOLDER_ACCOUNT = "devplaceholder";
    private static final String CARPETA_PDFS = "pdfs";

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.account-name:}")
    private String accountName;

    @Value("${azure.storage.account-key:}")
    private String accountKey;

    @Value("${azure.storage.container-name:documents}")
    private String containerDocuments;

    @Value("${azure.storage.container-name.backups:backups}")
    private String containerBackups;

    /** Años de validez del token SAS en URLs nuevas guardadas en BD. */
    @Value("${azure.storage.sas-years:10}")
    private int sasYears;

    private BlobServiceClient blobServiceClient;

    @PostConstruct
    void inicializarContenedores() {
        if (!estaConfigurado()) {
            log.warn(
                    "Azure Storage NO configurado (cuenta placeholder o vacía). "
                            + "Configure azure.storage.account-name y azure.storage.account-key "
                            + "o azure.storage.connection-string en application.properties"
            );
            return;
        }
        try {
            blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(resolverConnectionString())
                    .buildClient();
            asegurarContenedor(containerDocuments);
            asegurarContenedor(containerBackups);
            log.info(
                    "Azure Storage listo. Contenedores: '{}' (documentos/PDF), '{}' (backups)",
                    containerDocuments,
                    containerBackups
            );
        } catch (Exception e) {
            log.error("No se pudieron preparar los contenedores de Azure: {}", e.getMessage());
        }
    }

    public boolean estaConfigurado() {
        String cs = resolverConnectionString();
        return cs != null
                && !cs.isBlank()
                && !cs.contains(PLACEHOLDER_ACCOUNT)
                && !cs.contains("AccountKey=placeholder");
    }

    public String resolverConnectionString() {
        if (accountName != null && !accountName.isBlank()
                && accountKey != null && !accountKey.isBlank()) {
            return String.format(
                    Locale.ROOT,
                    "DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net",
                    accountName.trim(),
                    accountKey.trim()
            );
        }
        return connectionString != null ? connectionString.trim() : "";
    }

    public BlobServiceClient obtenerCliente() {
        if (blobServiceClient == null && estaConfigurado()) {
            blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(resolverConnectionString())
                    .buildClient();
        }
        return blobServiceClient;
    }

    public BlobContainerClient obtenerContenedorDocumentos() {
        BlobServiceClient client = obtenerCliente();
        if (client == null) {
            throw new IllegalStateException("Azure Storage no está configurado.");
        }
        return client.getBlobContainerClient(containerDocuments);
    }

    public BlobContainerClient obtenerContenedorBackups() {
        BlobServiceClient client = obtenerCliente();
        if (client == null) {
            throw new IllegalStateException("Azure Storage no está configurado.");
        }
        return client.getBlobContainerClient(containerBackups);
    }

    /**
     * Sube un archivo y devuelve URL con SAS de lectura (cuenta sin acceso público).
     */
    public String subirDocumento(MultipartFile archivo) throws IOException {
        if (!estaConfigurado()) {
            throw new IllegalStateException(
                    "Azure Storage no está configurado. Cree la cuenta en Azure Portal "
                            + "y complete azure.storage.account-name / account-key en application.properties. "
                            + "Ver backend/scripts/AZURE-STORAGE.md"
            );
        }
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("No se recibió ningún archivo.");
        }

        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        String blobPath = CARPETA_PDFS + "/" + UUID.randomUUID() + extension;

        BlobContainerClient container = obtenerContenedorDocumentos();
        BlobClient blobClient = container.getBlobClient(blobPath);

        blobClient.upload(archivo.getInputStream(), archivo.getSize(), true);

        String contentType = archivo.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = inferirContentType(extension);
        }
        BlobHttpHeaders headers = new BlobHttpHeaders();
        headers.setContentType(contentType);
        blobClient.setHttpHeaders(headers);

        String url = generarUrlConSas(blobClient);
        log.debug("Documento subido a Azure (SAS): {}", blobClient.getBlobName());
        return url;
    }

    /**
     * Resuelve una URL guardada en BD (con o sin SAS) a una URL con SAS vigente.
     */
    public String resolverUrlAcceso(String urlGuardada) {
        if (urlGuardada == null || urlGuardada.isBlank()) {
            return urlGuardada;
        }
        String limpia = urlGuardada.trim();
        if (!esUrlDeNuestraCuenta(limpia)) {
            return limpia;
        }
        if (tieneSasVigente(limpia)) {
            return limpia;
        }
        BlobClient blob = obtenerBlobDesdeUrl(limpia);
        return generarUrlConSas(blob);
    }

    public BlobClient obtenerBlobDesdeUrl(String urlGuardada) {
        URI uri = URI.create(urlGuardada.split("\\?")[0]);
        if (!esUrlDeNuestraCuenta(urlGuardada)) {
            throw new IllegalArgumentException("La URL no pertenece a la cuenta de almacenamiento configurada.");
        }
        String path = uri.getPath();
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        int slash = path.indexOf('/');
        if (slash <= 0) {
            throw new IllegalArgumentException("Ruta de blob inválida: " + urlGuardada);
        }
        String container = path.substring(0, slash);
        String blobPath = path.substring(slash + 1);
        return obtenerCliente()
                .getBlobContainerClient(container)
                .getBlobClient(blobPath);
    }

    public void transmitirBlob(String urlGuardada, OutputStream out) throws IOException {
        BlobClient blob = obtenerBlobDesdeUrl(urlGuardada);
        if (!blob.exists()) {
            throw new IllegalArgumentException("El archivo no existe en Azure Storage.");
        }
        blob.downloadStream(out);
    }

    public String resolverNombreArchivo(String urlGuardada, String nombreOpcional) {
        if (nombreOpcional != null && !nombreOpcional.isBlank()) {
            String n = nombreOpcional.trim().replaceAll("[\\\\/:*?\"<>|]", "_");
            return n.toLowerCase(Locale.ROOT).endsWith(".pdf") ? n : n + ".pdf";
        }
        try {
            String path = URI.create(urlGuardada.split("\\?")[0]).getPath();
            String segmento = path.substring(path.lastIndexOf('/') + 1);
            if (segmento.isBlank()) {
                return "documento.pdf";
            }
            return segmento.toLowerCase(Locale.ROOT).endsWith(".pdf") ? segmento : segmento + ".pdf";
        } catch (Exception e) {
            return "documento.pdf";
        }
    }

    public String obtenerContentType(String urlGuardada) {
        try {
            BlobClient blob = obtenerBlobDesdeUrl(urlGuardada);
            String ct = blob.getProperties().getContentType();
            return (ct != null && !ct.isBlank()) ? ct : "application/pdf";
        } catch (Exception e) {
            return "application/pdf";
        }
    }

    private String generarUrlConSas(BlobClient blobClient) {
        BlobSasPermission permiso = new BlobSasPermission().setReadPermission(true);
        OffsetDateTime expira = OffsetDateTime.now().plusYears(Math.max(1, sasYears));
        BlobServiceSasSignatureValues valores = new BlobServiceSasSignatureValues(expira, permiso);
        String sas = blobClient.generateSas(valores);
        return blobClient.getBlobUrl() + "?" + sas;
    }

    private boolean esUrlDeNuestraCuenta(String url) {
        if (url == null || accountName == null || accountName.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(url.split("\\?")[0]);
            String host = uri.getHost();
            return host != null && host.equalsIgnoreCase(accountName.trim() + ".blob.core.windows.net");
        } catch (Exception e) {
            return false;
        }
    }

    private boolean tieneSasVigente(String url) {
        if (!url.contains("sig=")) {
            return false;
        }
        try {
            String query = URI.create(url).getRawQuery();
            if (query == null) {
                return false;
            }
            for (String part : query.split("&")) {
                if (part.startsWith("se=")) {
                    String encoded = URLDecoder.decode(part.substring(3), StandardCharsets.UTF_8);
                    OffsetDateTime expira = OffsetDateTime.parse(encoded);
                    return expira.isAfter(OffsetDateTime.now().plusDays(1));
                }
            }
        } catch (Exception ignored) {
            // Si no se puede parsear, regenerar SAS
        }
        return false;
    }

    private void asegurarContenedor(String nombre) {
        BlobContainerClient container = obtenerCliente().getBlobContainerClient(nombre);
        if (!container.exists()) {
            container.create();
            log.info("Contenedor Azure creado (privado): {}", nombre);
        }
    }

    private static String inferirContentType(String extension) {
        return switch (extension) {
            case ".pdf" -> "application/pdf";
            case ".png" -> "image/png";
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".doc" -> "application/msword";
            case ".docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }
}
