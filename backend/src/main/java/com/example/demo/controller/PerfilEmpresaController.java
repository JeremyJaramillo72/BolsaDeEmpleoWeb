package com.example.demo.controller;

import com.example.demo.dto.UsuarioEmpresaDTO;
import com.example.demo.repository.UsuarioImagenRepository;
import com.example.demo.service.IUsuarioEmpresaService;
import com.example.demo.service.Impl.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/empresa-perfil")
@CrossOrigin(origins = "htpp://localhost:4200")
@RequiredArgsConstructor
public class PerfilEmpresaController {

    private final IUsuarioEmpresaService empresaService;
    private final CloudinaryService cloudinaryService;
    private final UsuarioImagenRepository usuarioImagenRepository;

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
    @PostMapping("/{id}/logo")
    public ResponseEntity<?> actualizarLogoEmpresa(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {

            String urlSegura = cloudinaryService.subirImagenEArchivo(archivo);

            System.out.println("¡Éxito! La URL en Cloudinary es: " + urlSegura);
            usuarioImagenRepository.guardarUrlImagen(id.intValue(), urlSegura);
            return ResponseEntity.ok(Map.of("urlImagen", urlSegura));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al subir la imagen a la nube");
        }
    }
}
