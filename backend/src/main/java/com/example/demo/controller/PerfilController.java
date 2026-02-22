package com.example.demo.controller;

import com.example.demo.model.exp_laboral;
import com.example.demo.model.UsuarioIdioma;
import com.example.demo.repository.ExpLaboralRepository;
import com.example.demo.repository.UsuarioIdiomaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
// Importa aquí tu repositorio y entidad según tus paquetes reales
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.model.Usuario;

import java.util.List;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "*") // 👈 Permite que Angular se conecte sin problemas de CORS
public class PerfilController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private UsuarioIdiomaRepository idiomaRepository;

    @Autowired
    private ExpLaboralRepository expLaboralRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDatosRegistro(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/idiomas/{idUsuario}")
    public ResponseEntity<List<UsuarioIdioma>> obtenerIdiomasUsuario(@PathVariable Long idUsuario) {
        List<UsuarioIdioma> idiomas = idiomaRepository.findByUsuario_IdUsuario(idUsuario);
        return ResponseEntity.ok(idiomas);
    }

    @GetMapping("/experiencias/{idUsuario}")
    public ResponseEntity<List<exp_laboral>> obtenerExperienciasUsuario(@PathVariable Long idUsuario) {
        List<exp_laboral> experiencias = expLaboralRepository.findByUsuario_IdUsuario(idUsuario);
        return ResponseEntity.ok(experiencias);
    }
}