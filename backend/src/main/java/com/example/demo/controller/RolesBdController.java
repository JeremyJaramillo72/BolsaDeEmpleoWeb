package com.example.demo.controller;
import com.example.demo.service.IRolesBdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rolesbd")
@CrossOrigin(origins = "*") // En producción, cámbialo por la URL de tu Angular
public class RolesBdController {

    @Autowired
    private IRolesBdService rolesBdService;
    /**
     * 1. Lista los roles personalizados creados por el administrador.
     * Endpoint: GET /api/admin/roles-bd
     */
    @GetMapping("/roles-bd")
    public ResponseEntity<?> obtenerRolesBD() {
        try {
            // Ahora devuelve una lista de Mapas (Objetos JSON)
            return ResponseEntity.ok(rolesBdService.listarRolesPersonalizados());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Lista los grupos base (roles nologin) de la arquitectura.
     * Endpoint: GET /api/admin/roles-base
     */
    @GetMapping("/roles-base")
    public ResponseEntity<?> obtenerRolesBase() {
        try {
            return ResponseEntity.ok(rolesBdService.listarRolesBase());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al obtener roles base"));
        }
    }

    /**
     * 3. Devuelve la estructura de esquemas y tablas para los checkboxes del Front.
     * Endpoint: GET /api/admin/esquemas
     */
    @GetMapping("/esquemas")
    public ResponseEntity<?> obtenerEsquemasYTablas() {
        try {
            return ResponseEntity.ok(rolesBdService.obtenerEstructuraEsquemas());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al obtener estructura de la DB: " + e.getMessage()));
        }
    }

    /**
     * 4. Crea el nuevo Rol SQL y asigna los GRANTs granulares.
     * Endpoint: POST /api/admin/roles-bd
     */
    @PostMapping("/roles-bd")
    public ResponseEntity<?> crearRolBD(@RequestBody Map<String, Object> datos) {
        try {
            rolesBdService.crearYAsignarPermisos(datos);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Rol de base de datos creado y configurado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al crear el rol: " + e.getMessage()));
        }
    }

    /**
     * 5. Consulta los privilegios actuales de un rol (útil para edición).
     * Endpoint: GET /api/admin/roles-bd/{idRol}/permisos
     */
    @GetMapping("/roles-bd/{idRol}/permisos")
    public ResponseEntity<?> obtenerPermisosRol(@PathVariable String idRol) {
        try {
            return ResponseEntity.ok(rolesBdService.consultarPermisosDeRol(idRol));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al consultar permisos: " + e.getMessage()));
        }
    }

    /**
     * 6. Elimina un rol y limpia sus dependencias en la DB.
     * Endpoint: DELETE /api/admin/roles-bd/{idRol}
     */
    @DeleteMapping("/roles-bd/{idRol}")
    public ResponseEntity<?> eliminarRolBD(@PathVariable String idRol) {
        try {
            rolesBdService.eliminarRol(idRol);
            return ResponseEntity.ok(Map.of("mensaje", "Rol " + idRol + " eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al eliminar el rol: " + e.getMessage()));
        }
    }
}