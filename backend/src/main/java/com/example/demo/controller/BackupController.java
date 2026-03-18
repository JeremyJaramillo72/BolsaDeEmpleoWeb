package com.example.demo.controller;

import com.example.demo.model.ConfiguracionBackup;
import com.example.demo.model.HistorialBackup;
import com.example.demo.service.BackupAutomatizacionService;
import com.example.demo.service.DatabaseBackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/seguridad")
@CrossOrigin(origins = "http://localhost:4200")
public class BackupController {

    private final DatabaseBackupService backupService;
    private final BackupAutomatizacionService backupAutomatizacionService;

    @PostMapping("/backup/descargar")
    public ResponseEntity<Resource> descargarRespaldo() {
        try {
            DatabaseBackupService.BackupResult resultado = backupService.generarBackupYSubirAzure();

            File backupFile = resultado.getArchivoLocal();
            String urlAzure = resultado.getUrlAzure();

            backupAutomatizacionService.registrarAuditoria("MANUAL", "EXITO", backupFile.length(), null, urlAzure);

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
            backupAutomatizacionService.registrarAuditoria("MANUAL", "ERROR", 0L, e.getMessage(), null);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/backup/descargar-nube")
    public ResponseEntity<Resource> descargarDesdeNube(@RequestParam String fileName) {
        try {
            Resource resource = backupService.descargarDeAzure(fileName);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(resource.contentLength())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/backup/restaurar/{idBackup}")
    public ResponseEntity<?> restaurarBackup(
            @PathVariable Long idBackup,
            @RequestParam(required = false, defaultValue = "clon") String modo) {

        try {
            if ("reemplazo".equalsIgnoreCase(modo)) {
                String mensaje = backupService.restaurarReemplazandoBdActual(idBackup);
                return ResponseEntity.ok(Map.of(
                        "mensaje", mensaje,
                        "modo", "reemplazo_total"
                ));
            } else {
                String nombreNuevaBd = backupService.restaurarEnNuevaBd(idBackup);
                return ResponseEntity.ok(Map.of(
                        "mensaje", "Restauración completada con éxito (Clon creado)",
                        "nombreNuevaBd", nombreNuevaBd,
                        "modo", "clon"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al restaurar: " + e.getMessage()));
        }
    }

    @GetMapping("/backup/configuracion")
    public ResponseEntity<ConfiguracionBackup> obtenerConfig() {
        return ResponseEntity.ok(backupAutomatizacionService.obtenerConfiguracion());
    }

    @PostMapping("/backup/configuracion")
    public ResponseEntity<ConfiguracionBackup> guardarConfig(@RequestBody ConfiguracionBackup config) {
        return ResponseEntity.ok(backupAutomatizacionService.guardarConfiguracion(config));
    }

    @GetMapping("/backup/historial")
    public ResponseEntity<List<HistorialBackup>> obtenerHistorial() {
        return ResponseEntity.ok(backupAutomatizacionService.obtenerHistorial());
    }
}