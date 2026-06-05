package com.example.demo.controller;

import com.example.demo.service.AzureBlobStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
public class AzureStorageController {

    private final AzureBlobStorageService azureBlobStorageService;

    public AzureStorageController(AzureBlobStorageService azureBlobStorageService) {
        this.azureBlobStorageService = azureBlobStorageService;
    }

    /**
     * Comprueba si Azure Storage está configurado y los contenedores existen.
     * GET /api/storage/estado
     */
    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> estado() {
        boolean ok = azureBlobStorageService.estaConfigurado();
        if (!ok) {
            return ResponseEntity.ok(Map.of(
                    "configurado", false,
                    "mensaje", "Falta connection-string o account-name/account-key en application.properties"
            ));
        }
        try {
            var docs = azureBlobStorageService.obtenerContenedorDocumentos();
            var backups = azureBlobStorageService.obtenerContenedorBackups();
            return ResponseEntity.ok(Map.of(
                    "configurado", true,
                    "contenedorDocumentos", docs.getBlobContainerName(),
                    "documentosExiste", docs.exists(),
                    "contenedorBackups", backups.getBlobContainerName(),
                    "backupsExiste", backups.exists()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "configurado", true,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Devuelve URL con SAS vigente (para PDFs guardados sin token o con SAS expirado).
     * GET /api/storage/url-acceso?url=https://cuenta.blob.core.windows.net/documents/pdfs/...
     */
    @GetMapping("/url-acceso")
    public ResponseEntity<?> urlAcceso(@RequestParam("url") String url) {
        try {
            String acceso = azureBlobStorageService.resolverUrlAcceso(url);
            return ResponseEntity.ok(Map.of("url", acceso));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Sirve el PDF/documento vía backend (iframe y window.open sin acceso público en Azure).
     * GET /api/storage/ver?url=...
     */
    @GetMapping("/ver")
    public ResponseEntity<StreamingResponseBody> verDocumento(
            @RequestParam("url") String url,
            @RequestParam(value = "nombre", required = false) String nombre
    ) {
        return servirDocumento(url, nombre, true);
    }

    @GetMapping("/descargar")
    public ResponseEntity<StreamingResponseBody> descargarDocumento(
            @RequestParam("url") String url,
            @RequestParam(value = "nombre", required = false) String nombre
    ) {
        return servirDocumento(url, nombre, false);
    }

    private ResponseEntity<StreamingResponseBody> servirDocumento(
            String url, String nombre, boolean inline
    ) {
        try {
            String nombreArchivo = azureBlobStorageService.resolverNombreArchivo(url, nombre);
            String contentType = azureBlobStorageService.obtenerContentType(url);
            StreamingResponseBody body = out -> azureBlobStorageService.transmitirBlob(url, out);
            String disposition = (inline ? "inline" : "attachment") + "; " + contentDisposition(nombreArchivo);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .body(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private static String contentDisposition(String filename) {
        String safe = filename.replaceAll("[\\\\/:*?\"<>|]", "_");
        String encoded = URLEncoder.encode(safe, StandardCharsets.UTF_8).replace("+", "%20");
        return "filename=\"" + safe + "\"; filename*=UTF-8''" + encoded;
    }

    /**
     * Redirección directa a URL con SAS (alternativa a /ver).
     */
    @GetMapping("/redirect")
    public ResponseEntity<Void> redirectDocumento(@RequestParam("url") String url) {
        try {
            String acceso = azureBlobStorageService.resolverUrlAcceso(url);
            return ResponseEntity.status(302).location(URI.create(acceso)).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
