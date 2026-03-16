package com.example.demo.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import org.springframework.validation.BindingResult;
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
            BindingResult bindingResult,
            @RequestParam(value = "habilidadesStr", required = false) String habilidadesStr,
            @RequestParam(value = "requisitosStr", required = false) String requisitosStr,
            @RequestParam(value = "archivoOficio", required = false) MultipartFile archivoOficio,
            @RequestParam(value = "idUsuarioAdmin", required = false) Long idUsuarioAdmin
    ) {
        if (bindingResult.hasErrors()) {
            StringBuilder errores = new StringBuilder("Datos mal formateados: ");
            bindingResult.getFieldErrors().forEach(error ->
                    errores.append(error.getField()).append(" (").append(error.getRejectedValue()).append("); ")
            );
            System.err.println("⚠️ Error de Binding en Oferta Física: " + errores.toString());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errores.toString()));
        }

        try {

            if (idUsuarioAdmin == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El ID del administrador es obligatorio."));
            }

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

            return ResponseEntity.ok(Map.of(
                    "mensaje", "¡Oferta física procesada correctamente!",
                    "status", "success"
            ));

        } catch (JsonProcessingException e) {
            System.err.println("⚠️ Error al parsear JSON de habilidades/requisitos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Las habilidades o requisitos tienen un formato inválido."));

        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Error de validación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            System.err.println("⚠️ Error Crítico en el Servidor:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al procesar la oferta: " + e.getMessage()));
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