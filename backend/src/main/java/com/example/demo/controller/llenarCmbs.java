package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academico")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class llenarCmbs {

    private final ProvinciaRepository provinciaRepository;
    private final CiudadRepository ciudadRepository;
    private final TipoHabilidadRepository tipoHabilidadRepository;
    private  final CatalogoHabilidadRepository catalogoHabilidadRepository;
    @Autowired
    private FacultadRepository facultadRepository;
    @Autowired
    private CarreraRepository carreraRepository;
    @Autowired
    private IdiomaRepository idiomaRepository;

    @Autowired
    private CategoriaOfertaRepository categoriaRepository;

    @Autowired
    private JornadaOfertaRepository jornadaRepository;

    @Autowired
    private ModalidadOfertaRepository modalidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolesRepository rolesRepository;


    @GetMapping("/provincias")
    public List <Provincia> listaProvincias(){
        return provinciaRepository.findAll();
    }
    @GetMapping("/ciudades/{idProvincia}")
    public List<Ciudad>ListaProvinciaPorCiudad (@PathVariable Integer idProvincia){
        return ciudadRepository.findByProvincia_IdProvincia(idProvincia);
    }
    @GetMapping("/facultades")
    public List<Facultad> listarFacultades() {
        return facultadRepository.findAll();
    }
    @GetMapping("/tipos-habilidad")
    public  List <TipoHabilidad> listarTiposHabilidad(){
        return tipoHabilidadRepository.findAll();
    }
    @GetMapping("/habilidades/{idTipo}")
    public  List <CatalogoHabilidad> listarHabilidadesPorTipo(@PathVariable Integer idTipo){
        return catalogoHabilidadRepository.findByTipoHabilidad_IdTipoHabilidad(idTipo);
    }




    @GetMapping("/carreras/{idFacultad}")
    public List<Carrera> listarCarrerasPorFacultad(@PathVariable Integer idFacultad) {
        return carreraRepository.findByFacultadIdFacultad(idFacultad);
    }

    @GetMapping("/idiomas")
    public List<Idioma> listarIdiomas() {
        return idiomaRepository.findAll();
    }


    @GetMapping("/categorias")
    public List<CategoriaOferta> listarCategorias() {
        return categoriaRepository.findAll();
    }


    @GetMapping("/jornadas")
    public List<JornadaOferta> listarJornadas() {
        return jornadaRepository.findAll();
    }

    @GetMapping("/modalidades")
    public List<ModalidadOferta> listarModalidades() {
        return modalidadRepository.findAll();
    }

    @GetMapping("/usuarios/estadisticas")
    public ResponseEntity<?> getEstadisticasUsuarios() {
        long total = usuarioRepository.count();
        // Aquí puedes añadir más lógica, por ahora devolvemos el total
        return ResponseEntity.ok(Map.of(
                "totalUsuarios", total,
                "fechaActualizacion", new java.util.Date()
        ));
    }

    // 2. Obtener auditorías de un usuario específico
    @GetMapping("/usuarios/{idUsuario}/auditorias")
    public List<Auditoria> getAuditoriasUsuario(@PathVariable Integer idUsuario) {
        // Nota: Necesitarás tener un AuditoriaRepository y la entidad Auditoria
        // return auditoriaRepository.findByUsuarioId(idUsuario);
        return List.of(); // Placeholder hasta que tengas tu entidad de auditoría
    }

    // 4. Exportar Auditorías de un usuario a Excel
    @GetMapping("/usuarios/{idUsuario}/auditorias/exportar")
    public ResponseEntity<byte[]> exportarAuditoriasExcel(@PathVariable Integer idUsuario) {
        // Lógica similar a la anterior filtrando por ID
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=auditoria_" + idUsuario + ".xlsx")
                .body(new byte[0]); // Placeholder
    }

    @GetMapping("/usuarios") // Ruta final: /api/academico/usuarios
    public List<Usuario> getTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/roles")
    public List<Roles> listarRoles() {
        return rolesRepository.findAll();
    }

    @PostMapping("/roles")
    public ResponseEntity<?> crearRol(@RequestBody Roles nuevoRol) {
        try {
            Roles rolGuardado = rolesRepository.save(nuevoRol);
            return ResponseEntity.status(HttpStatus.CREATED).body(rolGuardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }


    /*@GetMapping("/facultad/{idFacultad}")
    public ResponseEntity<?> listarCarrerasPorFacultad(@PathVariable Integer idFacultad) {

        try {
            List<Carrera> carreras = carreraRepository.findByFacultadIdFacultad(idFacultad);
            return ResponseEntity.ok(carreras);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener carreras"));
        }
    }*/


    @PostMapping("/usuarios/exportar")
    public ResponseEntity<byte[]> exportarUsuariosExcel(@RequestBody List<Usuario> usuarios) {
        try {
            // 1. Aquí llamarías a una lógica para convertir la lista 'usuarios' a Excel
            // byte[] excelBytes = excelService.generarExcel(usuarios);

            // Simulación de contenido para que no de error
            byte[] contenidoSimulado = new byte[0];

            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=reporte_usuarios.xlsx")
                    .body(contenidoSimulado);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping("/idiomas")
    public ResponseEntity<?> crearIdioma(@RequestBody Idioma nuevoIdioma) {
        try {
            // Guardamos el idioma. JPA se encarga de generar el ID automáticamente.
            Idioma idiomaGuardado = idiomaRepository.save(nuevoIdioma);
            return ResponseEntity.status(HttpStatus.CREATED).body(idiomaGuardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar el idioma: " + e.getMessage()));
        }
    }

    @PostMapping("/categorias")
    public ResponseEntity<?> crearCategoria(@RequestBody CategoriaOferta nuevaCategoria) {
        try {
            // Guardamos la categoría. idCategoria se autogenera en la BD.
            CategoriaOferta categoriaGuardada = categoriaRepository.save(nuevaCategoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoriaGuardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar la categoría: " + e.getMessage()));
        }
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Integer id) {
        try {
            // Verificamos si existe antes de intentar borrar
            if (categoriaRepository.existsById(id)) {
                categoriaRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La categoría con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo eliminar la categoría: " + e.getMessage()));
        }
    }

    @PostMapping("/facultades")
    public ResponseEntity<?> crearFacultad(@RequestBody Facultad nuevaFacultad) {
        try {
            // JPA se encarga de generar el idFacultad automáticamente
            Facultad facultadGuardada = facultadRepository.save(nuevaFacultad);
            return ResponseEntity.status(HttpStatus.CREATED).body(facultadGuardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar la facultad: " + e.getMessage()));
        }
    }


    @PostMapping("/jornadas")
    public ResponseEntity<?> crearJornada(@RequestBody JornadaOferta nuevaJornada) {
        try {
            // Guarda usando la entidad JornadaOferta
            JornadaOferta guardada = jornadaRepository.save(nuevaJornada);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar la jornada: " + e.getMessage()));
        }
    }

    @PostMapping("/modalidades")
    public ResponseEntity<?> crearModalidad(@RequestBody ModalidadOferta nuevaModalidad) {
        try {
            // Guarda el objeto; idModalidad se genera automáticamente
            ModalidadOferta guardada = modalidadRepository.save(nuevaModalidad);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar la modalidad: " + e.getMessage()));
        }
    }

    @PostMapping("/aggCarreras")
    public ResponseEntity<?> crearCarrera(@RequestBody Map<String, Object> payload) {

        try {
            String nombreCarrera = (String) payload.get("nombreCarrera");
            Integer idFacultad = Integer.valueOf(payload.get("idFacultad").toString());

            if (nombreCarrera == null || nombreCarrera.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre de la carrera es obligatorio"));
            }

            Facultad facultad = facultadRepository.findById(idFacultad)
                    .orElseThrow(() -> new RuntimeException("La facultad no existe"));

            Carrera carrera = new Carrera();
            carrera.setNombreCarrera(nombreCarrera.trim());
            carrera.setFacultad(facultad);

            carreraRepository.save(carrera);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Carrera creada correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear carrera: " + e.getMessage()));
        }
    }
}
