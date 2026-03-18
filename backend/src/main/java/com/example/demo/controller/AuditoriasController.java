package com.example.demo.controller;

import com.example.demo.dto.AuditoriaDTO;
import com.example.demo.dto.ResumenAuditoriaDTO;
import com.example.demo.service.IAuditoriaService;
import com.example.demo.service.ISesionService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class AuditoriasController {

    private final IAuditoriaService auditoriaService;
    private final ISesionService sesionService;

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
    @PutMapping("/sesiones/{idSesion}/cerrar-forzado")
    public ResponseEntity<?> cerrarSesionForzada(@PathVariable Long idSesion) {
        try {
            // Pasamos un string cualquiera o refactorizamos el service para no recibir el estado
            sesionService.actualizarEstadoCuentaYSesion(idSesion, "CERRADA");
            return ResponseEntity.ok(Map.of("mensaje", "La sesión ha sido finalizada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al cerrar sesión: " + e.getMessage()));
        }
    }


    @GetMapping("/exportar/pdf/{idParametro}")
    public ResponseEntity<byte[]> exportarAuditoriasPdfUniversal(
            @PathVariable Integer idParametro,
            @RequestParam String tipo) {

        // Llamamos al servicio que acabamos de refactorizar
        byte[] pdf = auditoriaService.exportarAuditoriasPdfPorTipo(idParametro, tipo.toUpperCase());

        // Configuramos el nombre del archivo dinámicamente
        String nombreArchivo = "reporte_" + tipo.toLowerCase() + "_" + idParametro + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}