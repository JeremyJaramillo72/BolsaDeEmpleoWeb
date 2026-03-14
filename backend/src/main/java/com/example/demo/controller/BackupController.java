package com.example.demo.controller;
import com.example.demo.service.DatabaseBackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Map;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/seguridad")
@CrossOrigin(origins = "http://localhost:4200")
public class BackupController {

    private final DatabaseBackupService backupService;

    @PostMapping("/backup/descargar")
    public ResponseEntity<Resource> descargarRespaldo() {
        try {
            File backupFile = backupService.generarBackupYSubirAzure();
            FileSystemResource resource = new FileSystemResource(backupFile);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + backupFile.getName());
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(backupFile.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
