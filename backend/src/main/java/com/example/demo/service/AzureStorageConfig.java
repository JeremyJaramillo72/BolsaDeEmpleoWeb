package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class AzureStorageConfig {

    @Value("${supabase.url:https://kkfcuzruwninlanwgmvf.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN1enJ1d25pbmxhbndnbXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDE5MTUsImV4cCI6MjEwMjU3NzkxNX0.a5sDBM6RKCwPYJDcdyA5ilhhkEU5T0xYWJ80azPXYTg}")
    private String supabaseKey;

    @Value("${supabase.bucket:cvs-postulantes}")
    private String bucketName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String subirDocumento(MultipartFile archivo) throws IOException {
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        String nombreUnico = UUID.randomUUID().toString() + extension;
        String contentType = archivo.getContentType() != null ? archivo.getContentType() : "application/octet-stream";
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + nombreUnico;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("apikey", supabaseKey)
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", contentType)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(archivo.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + nombreUnico;
            } else {
                throw new IOException("Error subiendo archivo a Supabase Storage (HTTP " + response.statusCode() + "): " + response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Subida interrumpida: " + e.getMessage(), e);
        }
    }
}
