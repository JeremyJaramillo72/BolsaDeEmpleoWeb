package com.example.demo.controller;

import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/postulaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PostulacionController {

    private final IPostulacionService postulacionService;

    @PostMapping(value = "/postular", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postular(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idOferta") Integer idOferta,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            postulacionService.registrarPostulacion(idUsuario, idOferta, archivo);
            response.put("mensaje", "Postulación enviada exitosamente");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("error", "Error al procesar la postulación: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/cancelar/{idPostulacion}")
    public ResponseEntity<?> cancelarPostulacion(@PathVariable Integer idPostulacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            postulacionService.cancelarPostulacion(idPostulacion);
            response.put("mensaje", "Postulación cancelada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Error al cancelar la postulación: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/archivo/{idPostulacion}")
    public ResponseEntity<?> obtenerArchivo(@PathVariable Integer idPostulacion) {
        try {
            String urlArchivo = postulacionService.obtenerUrlCV(idPostulacion);

            if (urlArchivo != null && !urlArchivo.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("url", urlArchivo);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No se encontró archivo para esta postulación"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener el archivo: " + e.getMessage()));
        }
    }
}

