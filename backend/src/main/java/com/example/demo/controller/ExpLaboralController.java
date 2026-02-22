package com.example.demo.controller;

import com.example.demo.service.IExpLaboralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/exp-laboral")
@CrossOrigin(origins = "*")
public class ExpLaboralController {

    @Autowired
    private IExpLaboralService expLaboralService;

    @PostMapping(value = "/registrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrar(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idCargo") Integer idCargo,
            @RequestParam("idEmpresaCatalogo") Integer idEmpresaCatalogo,
            @RequestParam("fechaInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(value = "fechaFin", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("ubicacion") String ubicacion,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            expLaboralService.registrarExpLaboral(
                    idUsuario, idCargo, idEmpresaCatalogo,
                    fechaInicio, fechaFin, descripcion, ubicacion, archivo
            );
            response.put("mensaje", "Experiencia laboral registrada exitosamente");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("error", "Error al registrar experiencia laboral: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

