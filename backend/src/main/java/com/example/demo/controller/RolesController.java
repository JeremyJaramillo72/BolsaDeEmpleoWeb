package com.example.demo.controller;

import com.example.demo.dto.EnlazarRolDTO;
import com.example.demo.model.Roles;
import com.example.demo.repository.RolesRepository;
import com.example.demo.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academico/roles") // Mantenemos tu ruta original
@CrossOrigin(origins = "*") // Para que Angular no te de problemas de CORS
public class RolesController {

    @Autowired
    private RolesRepository rolesRepository;

    // ¡NUEVO! Inyectamos el servicio que hace la magia de enlazar
    @Autowired
    private RolService rolService;

    // --- GET: Listar catálogo ---
    @GetMapping("/catalogo")
    public ResponseEntity<List<Roles>> getRolesCatalogo() {
        List<Roles> roles = rolesRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    // --- POST: Agregar rol ---
    @PostMapping("/agregar")
    public ResponseEntity<?> agregarRol(@RequestBody Roles nuevoRol) {
        try {
            Roles guardado = rolesRepository.save(nuevoRol);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar el rol"));
        }
    }

    // --- DELETE: Eliminar rol ---
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarRol(@PathVariable("id") Integer id) {
        try {
            if (rolesRepository.existsById(id)) {
                rolesRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Rol eliminado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "El rol con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se puede eliminar: el rol está asignado a usuarios existentes"));
        }
    }

    // --- PUT: Enlazar permisos de UI al Rol de Aplicativo ---
    @PutMapping("/enlazar-permisos")
    public ResponseEntity<String> enlazarPermisos(@RequestBody EnlazarRolDTO dto) {
        try {
            String resultado = rolService.enlazarPermisosUi(dto);

            if (resultado.startsWith("Error")) {
                return ResponseEntity.badRequest().body(resultado);
            }

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @GetMapping("/permisos-enlazados/{idRolBd}")
    public ResponseEntity<?> obtenerPermisosEnlazados(@PathVariable String idRolBd) {
        try {
            return rolesRepository.findByIdRolBd(idRolBd)
                    .map(r -> ResponseEntity.ok(Map.of(
                            "idRolAplicativo", r.getIdRol(),
                            "permisosUi", r.getPermisosUi() != null ? r.getPermisosUi() : ""
                    )))
                    .orElse(ResponseEntity.ok(Map.of(
                            "idRolAplicativo", "",
                            "permisosUi", ""
                    )));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}