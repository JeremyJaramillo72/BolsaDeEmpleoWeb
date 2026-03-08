package com.example.demo.controller;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPostulacionDTO;
import com.example.demo.repository.Views.IMisPostulaciones;
import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/revision-postulante")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RevisionPostulantesController {
    private final IPostulacionService iPostulacionService;

    @GetMapping("/postulaciones/{idPostulacion}/resumen")
    public ResponseEntity<?> verResumenPostulacion(@PathVariable Long idPostulacion) {
        try {
            ResumenPostulacionDTO resumen = iPostulacionService.obtenerResumenPostulacion(idPostulacion);
            if (resumen == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/mis-postulaciones/{idUsuario}")
    public ResponseEntity<?> listarMisPostulaciones(@PathVariable Long idUsuario) {
        try {
            List<IMisPostulaciones> lista = iPostulacionService.listarMisPostulaciones(idUsuario);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/postulaciones/{idPostulacion}/perfil-completo")
    public ResponseEntity<PerfilPostulanteDTO> verPerfilCompleto(@PathVariable Long idPostulacion) {

        PerfilPostulanteDTO perfil = iPostulacionService.obtenerPerfilDelCandidato(idPostulacion);

        if (perfil == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(perfil);
    }
    @GetMapping("/ofertas/{idOferta}/postulantes")
    public ResponseEntity<List<PostulanteResumenDTO>> obtenerCandidatosDeOferta(@PathVariable Long idOferta) {

        List<PostulanteResumenDTO> lista = iPostulacionService.listarCandidatosPorOferta(idOferta);

        return ResponseEntity.ok(lista);
    }
    @PostMapping("/postulaciones/{idPostulacion}/evaluar-item")
    public ResponseEntity<Void> evaluarItemDetalle(
            @PathVariable Long idPostulacion,
            @RequestBody ItemEvaluacionDTO dto) {
        iPostulacionService.evaluarItemIndividual(idPostulacion, dto);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/postulaciones/{idPostulacion}/evaluar")
    public ResponseEntity<Void> evaluarPostulacionGeneral(
            @PathVariable Long idPostulacion,
            @RequestBody ItemEvaluacionDTO dto) {
        try {
            iPostulacionService.evaluarPostulacionGeneral(
                    idPostulacion,
                    dto.getEstado(),
                    dto.getObservacion()
            );
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.err.println("Error al evaluar la postulación general: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
