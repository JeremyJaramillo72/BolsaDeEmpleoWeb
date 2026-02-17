package com.example.demo.controller;

import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import com.example.demo.service.IOfertaLaboralService;
import com.example.demo.service.Impl.OfertaLaboralServiceImpl;
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

    private final IOfertaLaboralService ofertaService;

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
}