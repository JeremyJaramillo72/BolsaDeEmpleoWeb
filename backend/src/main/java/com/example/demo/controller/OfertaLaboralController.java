package com.example.demo.controller;

import com.example.demo.dto.IOfertaResumen;
import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.repository.Views.IOfertaDetallada;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import com.example.demo.service.IOfertaLaboralService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class OfertaLaboralController {

    @Autowired
    private IOfertaLaboralService ofertaService;

    @PostMapping
    public OfertaLaboral guardarOferta(@RequestBody OfertaLaboralDTO ofertaDTO) {
        return ofertaService.guardarOferta(ofertaDTO);
    }

    @GetMapping("/empresa/{idEmpresa}")
    public List<IOfertaEmpresaDTO> listarPorEmpresa(@PathVariable Long idEmpresa) {
        return ofertaService.listarPorEmpresa(idEmpresa);
    }

    @GetMapping
    public List<OfertaLaboral> listarTodas() {
        return ofertaService.listarTodas();
    }

    @GetMapping("/{idOferta}/postulantes")
    public ResponseEntity<List<IPostulanteOfertaDTO>> obtenerPostulantes(@PathVariable Long idOferta) {
        List<IPostulanteOfertaDTO> postulantes = ofertaService.obtenerPostulantes(idOferta);
        return ResponseEntity.ok(postulantes);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<IOfertaResumen>> listarPorEstado(@PathVariable String estado) {
        List<IOfertaResumen> ofertas = ofertaService.listarPorEstado(estado);
        return ResponseEntity.ok(ofertas);
    }

    @PutMapping("/{idOferta}/validar")
    public ResponseEntity<?> validarOferta (
            @PathVariable Long idOferta, // Debe ser Long
            @RequestParam String estado
    ) {
        try {
            ofertaService.cambiarEstadoOferta((long) Math.toIntExact(idOferta), estado);
            return ResponseEntity.ok("Oferta actualizada a: " + estado);
        } catch(Exception e) {
            e.printStackTrace(); // Imprime el error en consola para verlo si vuelve a fallar
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/completo/{idUsuario}")
    public ResponseEntity<?> listarOfertasCompleto(@PathVariable Long idUsuario) {
        try {
            List<IOfertaDetallada> resultado = ofertaService.listarOfertasCompleto(idUsuario);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{idOferta}/favorita/{idUsuario}")
    public ResponseEntity<?> toggleFavorita(
            @PathVariable Integer idOferta,
            @PathVariable Long idUsuario) {
        try {
            String resultado = ofertaService.toggleFavorita(idOferta, idUsuario);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}