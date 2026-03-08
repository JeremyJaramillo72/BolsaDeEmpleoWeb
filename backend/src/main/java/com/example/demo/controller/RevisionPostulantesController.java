package com.example.demo.controller;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPerfilBaseDTO;
import com.example.demo.dto.ResumenSeccionDTO;
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

    // ── Endpoints por sección ────────────────────────────────────────────

    @GetMapping("/postulaciones/{idPostulacion}/perfil-base")
    public ResponseEntity<?> verPerfilBase(@PathVariable Long idPostulacion) {
        try {
            ResumenPerfilBaseDTO dto = iPostulacionService.obtenerPerfilBase(idPostulacion);
            return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error perfil-base: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/postulaciones/{idPostulacion}/formacion")
    public ResponseEntity<List<ResumenSeccionDTO>> verFormacion(@PathVariable Long idPostulacion) {
        try {
            return ResponseEntity.ok(iPostulacionService.obtenerFormacion(idPostulacion));
        } catch (Exception e) {
            System.err.println("Error formacion: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/postulaciones/{idPostulacion}/experiencia")
    public ResponseEntity<List<ResumenSeccionDTO>> verExperiencia(@PathVariable Long idPostulacion) {
        try {
            return ResponseEntity.ok(iPostulacionService.obtenerExperiencia(idPostulacion));
        } catch (Exception e) {
            System.err.println("Error experiencia: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/postulaciones/{idPostulacion}/cursos")
    public ResponseEntity<List<ResumenSeccionDTO>> verCursos(@PathVariable Long idPostulacion) {
        try {
            return ResponseEntity.ok(iPostulacionService.obtenerCursos(idPostulacion));
        } catch (Exception e) {
            System.err.println("Error cursos: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/postulaciones/{idPostulacion}/idiomas")
    public ResponseEntity<List<ResumenSeccionDTO>> verIdiomas(@PathVariable Long idPostulacion) {
        try {
            return ResponseEntity.ok(iPostulacionService.obtenerIdiomas(idPostulacion));
        } catch (Exception e) {
            System.err.println("Error idiomas: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
}
