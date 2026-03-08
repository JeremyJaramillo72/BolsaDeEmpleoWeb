package com.example.demo.controller;

import com.example.demo.dto.NuevaEmpresaAdminDTO;
import com.example.demo.dto.OfertaHabilidadDTO;
import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.dto.RequisitoManualDTO;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.Views.IOfertaFisicaAdminDTO;
import com.example.demo.service.IOfertaLaboralService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ofertas")
@RequiredArgsConstructor
public class OfertaAdminController {

    private final IOfertaLaboralService iOfertaLaboralService;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/admin/empresas/buscar")
    public ResponseEntity<List<Map<String, Object>>> buscarEmpresas(@RequestParam("termino") String termino) {
        List<Map<String, Object>> empresas = usuarioEmpresaRepository.buscarEmpresasRealesPredictivo(termino);
        return ResponseEntity.ok(empresas);
    }

    @PostMapping(value = "/registrar-fisica", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrarOfertaFisica(
            @ModelAttribute OfertaLaboralDTO dto,
            @RequestParam(value = "habilidadesStr", required = false) String habilidadesStr,
            @RequestParam(value = "requisitosStr", required = false) String requisitosStr,
            @RequestParam(value = "archivoOficio", required = false) MultipartFile archivoOficio,
            @RequestParam("idUsuarioAdmin") Long idUsuarioAdmin
    ) {
        try {
            if (habilidadesStr != null && !habilidadesStr.equals("null") && !habilidadesStr.trim().isEmpty()) {
                List<OfertaHabilidadDTO> habilidades = objectMapper.readValue(
                        habilidadesStr,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, OfertaHabilidadDTO.class)
                );
                dto.setHabilidades(habilidades);
            }

            if (requisitosStr != null && !requisitosStr.equals("null") && !requisitosStr.trim().isEmpty()) {
                List<RequisitoManualDTO> requisitos = objectMapper.readValue(
                        requisitosStr,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, RequisitoManualDTO.class)
                );
                dto.setRequisitos_manuales(requisitos);
            }
            iOfertaLaboralService.guardarOfertaFisica(dto, archivoOficio, idUsuarioAdmin);

            return ResponseEntity.ok(Map.of("mensaje", "¡Oferta física guardada correctamente!"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al procesar la oferta: " + e.getMessage()));
        }
    }
    @GetMapping("/fisicas")
    public ResponseEntity<List<IOfertaFisicaAdminDTO>> listarOfertasFisicas() {
        try {
            List<IOfertaFisicaAdminDTO> ofertas = iOfertaLaboralService.listarOfertasFisicasAdmin();
            return ResponseEntity.ok(ofertas);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping("/admin/empresas/crear")
    public ResponseEntity<?> crearEmpresaAdmin(@RequestBody NuevaEmpresaAdminDTO dto) {
        try {
            Long idNuevaEmpresa = iOfertaLaboralService.crearEmpresaPorAdmin(dto);
            return ResponseEntity.ok(Map.of("idEmpresa", idNuevaEmpresa));

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El correo o el RUC ya están registrados."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ocurrió un error al crear la empresa."));
        }
    }
}