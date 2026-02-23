package com.example.demo.controller;

import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresa")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RevisionPostulantesController {
    private final IPostulacionService iPostulacionService;

    @GetMapping("/postulaciones/{idPostulacion}/perfil-completo")
    public ResponseEntity<PerfilPostulanteDTO> verPerfilCompleto(@PathVariable Long idPostulacion) {

        PerfilPostulanteDTO perfil = iPostulacionService.obtenerPerfilDelCandidato(idPostulacion);

        if (perfil == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(perfil);
    }
}
