package com.example.demo.controller;

import com.example.demo.service.IPerfilAcademicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil-academico")
@CrossOrigin(origins = "*") // 👈 Permite la conexión con tu Angular en el puerto 4200
public class PerfilAcademicoController {

    @Autowired
    private IPerfilAcademicoService perfilAcademicoService;

    @PostMapping(value = "/registrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrarPerfil(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idCarrera") Integer idCarrera,
            @RequestParam("fechaGraduacion") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaGraduacion,
            @RequestParam("numeroSenescyt") String numeroSenescyt,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validamos que el archivo no esté vacío antes de procesar
            if (archivo.isEmpty()) {
                response.put("error", "El archivo del título es obligatorio");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Llamamos al servicio (que a su vez ejecuta el Procedure en PostgreSQL)
            perfilAcademicoService.registrarNuevoTitulo(
                    idUsuario,
                    idCarrera,
                    fechaGraduacion,
                    numeroSenescyt,
                    archivo.getBytes() // Convertimos el MultipartFile a arreglo de bytes
            );

            response.put("mensaje", "Título y documentación registrados exitosamente");
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IOException e) {
            response.put("error", "Error al procesar el archivo binario: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            response.put("error", "Error en el servidor: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}