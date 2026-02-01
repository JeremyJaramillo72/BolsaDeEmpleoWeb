package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
// Importa aquí tu repositorio y entidad según tus paquetes reales
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.model.Usuario;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "*") // 👈 Permite que Angular se conecte sin problemas de CORS
public class PerfilController {

    @Autowired
    private UsuarioRepository repository;
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDatosRegistro(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}