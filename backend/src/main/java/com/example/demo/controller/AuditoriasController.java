package com.example.demo.controller;

import com.example.demo.dto.AuditoriaDTO;
import com.example.demo.dto.ResumenAuditoriaDTO;
import com.example.demo.service.IAuditoriaService;
import com.example.demo.service.ISesionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditorias") // 👈 Nombre de la API actualizado
@CrossOrigin(origins = "*")
public class AuditoriasController {

    @Autowired
    private IAuditoriaService auditoriaService;


    // 👇 AGREGA ESTO
    @Autowired
    private ISesionService sesionService;

    // ✅ GET /api/auditorias/usuarios
    @GetMapping("/usuarios")
    public ResponseEntity<List<Map<String, Object>>> obtenerTodosUsuarios() {
        return ResponseEntity.ok(auditoriaService.obtenerTodosUsuarios());
    }

    // ✅ GET /api/auditorias/estadisticas
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> getEstadisticasUsuarios() {
        return ResponseEntity.ok(auditoriaService.getEstadisticasUsuarios());
    }

    // ✅ GET /api/auditorias/usuario/{idUsuario}
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<AuditoriaDTO>> getAuditoriasUsuario(
            @PathVariable Integer idUsuario) {
        return ResponseEntity.ok(auditoriaService.getAuditoriasUsuario(idUsuario));
    }

    // ✅ GET /api/auditorias/resumen/{idUsuario}
    @GetMapping("/resumen/{idUsuario}")
    public ResponseEntity<ResumenAuditoriaDTO> getResumenAuditoria(
            @PathVariable Integer idUsuario) {
        return ResponseEntity.ok(auditoriaService.getResumenAuditoria(idUsuario));
    }

    // ✅ POST /api/auditorias/exportar-usuarios
    @PostMapping("/exportar-usuarios")
    public ResponseEntity<byte[]> exportarUsuariosExcel(
            @RequestBody Map<String, Object> body) {
        byte[] excel = auditoriaService.exportarUsuariosExcel(body);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=usuarios.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    // ✅ GET /api/auditorias/exportar-usuario/{idUsuario}
    @GetMapping("/exportar-usuario/{idUsuario}")
    public ResponseEntity<byte[]> exportarAuditoriasExcel(
            @PathVariable Integer idUsuario) {
        byte[] excel = auditoriaService.exportarAuditoriasExcel(idUsuario);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=auditorias_u" + idUsuario + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    // ================================================================
// 3. AuditoriasController.java — Agregar estos 3 endpoints
// ================================================================

    @GetMapping("/usuario/{idUsuario}/tipo/{tipo}")
    public ResponseEntity<List<AuditoriaDTO>> getAuditoriasUsuarioPorTipo(
            @PathVariable Integer idUsuario,
            @PathVariable String tipo) {
        List<AuditoriaDTO> resultado = auditoriaService.getAuditoriasUsuarioPorTipo(idUsuario, tipo.toUpperCase());
        return ResponseEntity.ok(resultado);
    }

    // 🤑GET /api/auditorias/exportar-usuario/{idUsuario}/excel/{tipo}
    //😎 Ejemplo: /api/auditorias/exportar-usuario/9/excel/DELETE
    @GetMapping("/exportar-usuario/{idUsuario}/excel/{tipo}")
    public ResponseEntity<byte[]> exportarAuditoriasExcelPorTipo(
            @PathVariable Integer idUsuario,
            @PathVariable String tipo) {
        byte[] excel = auditoriaService.exportarAuditoriasExcelPorTipo(idUsuario, tipo.toUpperCase());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=auditorias_" + tipo.toLowerCase() + "_u" + idUsuario + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    // ✅ GET /api/auditorias/exportar-usuario/{idUsuario}/pdf/{tipo}
    // Ejemplo: /api/auditorias/exportar-usuario/9/pdf/UPDATE
    @GetMapping("/exportar-usuario/{idUsuario}/pdf/{tipo}")
    public ResponseEntity<byte[]> exportarAuditoriasPdfPorTipo(
            @PathVariable Integer idUsuario,
            @PathVariable String tipo) {
        byte[] pdf = auditoriaService.exportarAuditoriasPdfPorTipo(idUsuario, tipo.toUpperCase());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=auditorias_" + tipo.toLowerCase() + "_u" + idUsuario + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/sesiones")
    public ResponseEntity<List<Map<String, Object>>> getSesiones() {
        return ResponseEntity.ok(auditoriaService.getSesiones());
    }


    // ✅ PUT /api/auditorias/sesiones/{idSesion}/estado-cuenta
    @PutMapping("/sesiones/{idSesion}/estado-cuenta")
    public ResponseEntity<?> cambiarEstadoCuentaYSesion(
            @PathVariable Long idSesion,
            @RequestBody Map<String, String> request) {

        try {
            String nuevoEstado = request.get("estado"); // Recibe "Activo" o "Inactivo"

            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El estado de la cuenta es requerido"));
            }

            // Llamamos a nuestro nuevo método 2x1
            sesionService.actualizarEstadoCuentaYSesion(idSesion, nuevoEstado);

            return ResponseEntity.ok(Map.of("mensaje", "La cuenta ha sido cambiada a " + nuevoEstado));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al cambiar estado de cuenta: " + e.getMessage()));
        }
    }
}