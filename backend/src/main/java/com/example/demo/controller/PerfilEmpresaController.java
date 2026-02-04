package com.example.demo.controller;

import com.example.demo.dto.UsuarioEmpresaDTO;
import com.example.demo.service.IUsuarioEmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresa-perfil")
@CrossOrigin(origins = "htpp://localhost:4200")
@RequiredArgsConstructor
public class PerfilEmpresaController {

    private final IUsuarioEmpresaService empresaService;


    @PostMapping
    public ResponseEntity<UsuarioEmpresaDTO> guardar(@RequestBody UsuarioEmpresaDTO dto) {
        return ResponseEntity.ok(empresaService.guardar(dto));
    }

    @PutMapping("/{idEmpresa}")
    public ResponseEntity<UsuarioEmpresaDTO> editar(
            @PathVariable Long idEmpresa,
            @RequestBody UsuarioEmpresaDTO dto) {

        return ResponseEntity.ok(empresaService.editar(idEmpresa, dto));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<UsuarioEmpresaDTO> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(empresaService.ObtenerIdUsuario(idUsuario));
    }
}
