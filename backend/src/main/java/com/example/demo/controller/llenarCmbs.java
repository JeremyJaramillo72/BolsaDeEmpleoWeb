package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
    private final CargoRepository cargoRepository;
    private final  CatalogoEmpresaRepository catalogoEmpresaRepository;
    private final  FacultadRepository facultadRepository;
    private final CarreraRepository carreraRepository;
    private final  IdiomaRepository idiomaRepository;

    private  final CategoriaOfertaRepository categoriaRepository;

    private final  JornadaOfertaRepository jornadaRepository;

    private final ModalidadOfertaRepository modalidadRepository;

    private final  UsuarioRepository usuarioRepository;

    private final RolesRepository rolesRepository;



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


    @GetMapping("/buscar")
    public ResponseEntity<List<CatalogoEmpresa>> buscarEmpresas(@RequestParam("termino") String termino) {
        List<CatalogoEmpresa> empresas = catalogoEmpresaRepository.buscarEmpresasPredictivo(termino);
        return ResponseEntity.ok(empresas);
    }


    @GetMapping("/cargos/buscar")
    public List<Cargo> buscarCargos (@RequestParam("termino") String termino)
    {
        if (termino==null || termino.trim().length()<2){
            return new ArrayList<>();
        }
        return cargoRepository.buscarCargosPredictivo(termino);
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

    @GetMapping("/cargos")
    public List<Cargo> listarCargos() {
        return cargoRepository.findAll();
    }

    @GetMapping("/empresas")
    public List<CatalogoEmpresa> listarEmpresasCatalogo() {
        return catalogoEmpresaRepository.findAll();
    }

    @GetMapping("/usuarios/estadisticas")
    public ResponseEntity<?> getEstadisticasUsuarios() {
        long total = usuarioRepository.count();
        return ResponseEntity.ok(Map.of(
                "totalUsuarios", total,
                "fechaActualizacion", new java.util.Date()
        ));
    }

    @GetMapping("/usuarios/{idUsuario}/auditorias")
    public List<Auditoria> getAuditoriasUsuario(@PathVariable Integer idUsuario) {
        return List.of();
    }


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

    // Agregar este endpoint en tu CarreraController o AdminController
    @GetMapping("/carreras/facultad/{idFacultad}")
    public ResponseEntity<List<Carrera>> getCarrerasPorFacultad(@PathVariable Integer idFacultad) {
        try {
            List<Carrera> carreras = carreraRepository.findByFacultadIdFacultad(idFacultad);

            if (carreras.isEmpty()) {
                return ResponseEntity.noContent().build(); // 204 si no hay carreras
            }

            return ResponseEntity.ok(carreras);
        } catch (Exception e) {
            System.err.println("Error al obtener carreras por facultad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Agregar este endpoint en tu CarreraController o AdminController

    @GetMapping("/carreras/catalogo")
    public ResponseEntity<List<Carrera>> getCarrerasCatalogo() {
        try {
            List<Carrera> carreras = carreraRepository.findAll();

            if (carreras.isEmpty()) {
                return ResponseEntity.noContent().build(); // 204 si no hay carreras
            }

            return ResponseEntity.ok(carreras);
        } catch (Exception e) {
            System.err.println("Error al obtener catálogo de carreras: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


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


    // Metodos para Delete
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

    // Eliminar facultades
    @DeleteMapping("/facultades/{id}")
    public ResponseEntity<?> eliminarFacultad(@PathVariable Integer id) {
        try {
            if (facultadRepository.existsById(id)) {
                facultadRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Facultad eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La facultad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se puede eliminar la facultad porque tiene carreras asociadas o hubo un error en el servidor"));
        }
    }

    // Eliminar idiomas
    @DeleteMapping("/idiomas/{id}")
    public ResponseEntity<?> eliminarIdioma(@PathVariable Integer id) {
        try {
            if (idiomaRepository.existsById(id)) {
                idiomaRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Idioma eliminado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "El idioma con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo eliminar el idioma: " + e.getMessage()));
        }
    }

    @DeleteMapping("/jornadas/{id}")
    public ResponseEntity<?> eliminarJornada(@PathVariable Integer id) {
        try {
            if (jornadaRepository.existsById(id)) {
                jornadaRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Jornada laboral eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La jornada con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se puede eliminar la jornada porque está siendo utilizada en registros del sistema"));
        }
    }

    @DeleteMapping("/modalidades/{id}")
    public ResponseEntity<?> eliminarModalidad(@PathVariable Integer id) {
        try {
            if (modalidadRepository.existsById(id)) {
                modalidadRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Modalidad eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La modalidad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se puede eliminar la modalidad porque está en uso por otros registros"));
        }
    }

    // DELETE CARRERAS
    @DeleteMapping("/carreras/{id}")
    public ResponseEntity<?> eliminarCarrera(@PathVariable Integer id) {
        try {
            // 1. Verificamos si la carrera existe
            if (carreraRepository.existsById(id)) {
                carreraRepository.deleteById(id);

                return ResponseEntity.ok(Map.of("mensaje", "Carrera eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La carrera con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            // Error común: La carrera está asignada a estudiantes o egresados
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se puede eliminar la carrera porque tiene registros vinculados (estudiantes u ofertas)"));
        }
    }

    //Put
    @PutMapping("/categorias/{id}")
    public ResponseEntity<?> actualizarCategoria(@PathVariable Integer id, @RequestBody CategoriaOferta categoriaActualizada) {
        try {
            // Ejecutamos el UPDATE directo llamando a tu CategoriaOfertaRepository
            int filasAfectadas = categoriaRepository.actualizarNombreCategoria(id, categoriaActualizada.getNombreCategoria());

            if (filasAfectadas > 0) {
                // Si afectó al menos 1 fila, todo fue un éxito
                return ResponseEntity.ok(Map.of("mensaje", "Categoría actualizada correctamente"));
            } else {
                // Si afectó 0 filas, significa que ese ID no existía en la base de datos
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La categoría con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la categoría: " + e.getMessage()));
        }
    }

    @PutMapping("/carreras/{id}")
    public ResponseEntity<?> actualizarCarrera(@PathVariable Integer id, @RequestBody Map<String, Object> datosActualizados) {
        try {
            // Extraemos los datos del JSON que manda Angular
            String nombreCarrera = datosActualizados.get("nombreCarrera").toString();
            Integer idFacultad = Integer.parseInt(datosActualizados.get("idFacultad").toString());

            // Ejecutamos el UPDATE directo en el repositorio
            int filasAfectadas = carreraRepository.actualizarCarreraDirecto(id, nombreCarrera, idFacultad);

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Carrera actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La carrera con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la carrera: " + e.getMessage()));
        }
    }

    @PutMapping("/facultades/{id}")
    public ResponseEntity<?> actualizarFacultad(@PathVariable Integer id, @RequestBody Facultad facultadActualizada) {
        try {
            // Ejecutamos el UPDATE directo llamando a tu FacultadRepository
            int filasAfectadas = facultadRepository.actualizarNombreFacultad(id, facultadActualizada.getNombreFacultad());

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Facultad actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La facultad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la facultad: " + e.getMessage()));
        }
    }

    @PutMapping("/idiomas/{id}")
    public ResponseEntity<?> actualizarIdioma(@PathVariable Integer id, @RequestBody Idioma idiomaActualizado) {
        try {
            // Ejecutamos el UPDATE directo llamando a tu IdiomaRepository
            int filasAfectadas = idiomaRepository.actualizarNombreIdioma(id, idiomaActualizado.getNombreIdioma());

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Idioma actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "El idioma con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar el idioma: " + e.getMessage()));
        }
    }


    @PutMapping("/jornadas/{id}")
    public ResponseEntity<?> actualizarJornada(@PathVariable Integer id, @RequestBody JornadaOferta jornadaActualizada) {
        try {
            int filasAfectadas = jornadaRepository.actualizarNombreJornada(id, jornadaActualizada.getNombreJornada());
            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Jornada actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La jornada con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la jornada: " + e.getMessage()));
        }
    }

    @PutMapping("/modalidades/{id}")
    public ResponseEntity<?> actualizarModalidad(@PathVariable Integer id, @RequestBody ModalidadOferta modalidadActualizada) {
        try {
            int filasAfectadas = modalidadRepository.actualizarNombreModalidad(id, modalidadActualizada.getNombreModalidad());
            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Modalidad actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La modalidad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la modalidad: " + e.getMessage()));
        }
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<?> actualizarRol(@PathVariable Integer id, @RequestBody Roles rolActualizado) {
        try {
            // Ejecutamos el UPDATE directo llamando a tu RolesRepository
            int filasAfectadas = rolesRepository.actualizarNombreRol(id, rolActualizado.getNombreRol());

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Rol actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "El rol con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar el rol: " + e.getMessage()));
        }
    }

    @PostMapping("/aggProvincias")
    public ResponseEntity<?> agregarProvincia(@RequestBody Provincia provincia) {
        try {
            if (provincia.getNombreProvincia() == null || provincia.getNombreProvincia().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre de la provincia es obligatorio"));
            }

            provincia.setNombreProvincia(provincia.getNombreProvincia().trim());
            provinciaRepository.save(provincia);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Provincia creada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear provincia: " + e.getMessage()));
        }
    }

    @PutMapping("/provincias/{id}")
    public ResponseEntity<?> actualizarProvincia(@PathVariable Integer id, @RequestBody Provincia provinciaActualizada) {
        try {
            int filasAfectadas = provinciaRepository.actualizarNombreProvincia(id, provinciaActualizada.getNombreProvincia());

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Provincia actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La provincia con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la provincia: " + e.getMessage()));
        }
    }

    @DeleteMapping("/provincias/{id}")
    public ResponseEntity<?> eliminarProvincia(@PathVariable Integer id) {
        try {
            if (provinciaRepository.existsById(id)) {
                provinciaRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Provincia eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La provincia con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            // Este catch atrapará si intentas borrar una provincia que ya tiene ciudades asociadas (Constraint Violation)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo eliminar la provincia porque está en uso o no existe."));
        }
    }


    // ==========================================
    //      1. OBTENER TODAS LAS CIUDADES
    // ==========================================
    @GetMapping("/ciudades")
    public ResponseEntity<List<Ciudad>> obtenerCiudades() {
        return ResponseEntity.ok(ciudadRepository.findAll());
    }

    // ==========================================
    //      2. OBTENER CIUDADES POR PROVINCIA
    // ==========================================
    @GetMapping("/ciudades/provincia/{idProvincia}")
    public ResponseEntity<List<Ciudad>> obtenerCiudadesPorProvincia(@PathVariable Integer idProvincia) {
        return ResponseEntity.ok(ciudadRepository.findByProvincia_IdProvincia(idProvincia));
    }

    // ==========================================
    //      3. AGREGAR CIUDAD (POST)
    // ==========================================
    @PostMapping("/aggCiudades")
    public ResponseEntity<?> agregarCiudad(@RequestBody Map<String, Object> payload) {
        try {
            String nombreCiudad = (String) payload.get("nombreCiudad");
            Integer idProvincia = Integer.valueOf(payload.get("idProvincia").toString());

            if (nombreCiudad == null || nombreCiudad.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre de la ciudad es obligatorio"));
            }

            // Buscamos la provincia para establecer la relación
            Provincia provincia = provinciaRepository.findById(idProvincia)
                    .orElseThrow(() -> new RuntimeException("La provincia seleccionada no existe"));

            Ciudad ciudad = new Ciudad();
            ciudad.setNombreCiudad(nombreCiudad.trim());
            ciudad.setProvincia(provincia);

            ciudadRepository.save(ciudad);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Ciudad agregada correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear la ciudad: " + e.getMessage()));
        }
    }

    // ==========================================
    //      4. ACTUALIZAR CIUDAD (PUT)
    // ==========================================
    @PutMapping("/ciudades/{id}")
    public ResponseEntity<?> actualizarCiudad(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        try {
            String nombreCiudad = payload.get("nombreCiudad").toString().trim();
            Integer idProvincia = Integer.valueOf(payload.get("idProvincia").toString());

            // Ejecutamos el UPDATE directo llamando a tu CiudadRepository
            int filasAfectadas = ciudadRepository.actualizarCiudadDirecto(id, nombreCiudad, idProvincia);

            if (filasAfectadas > 0) {
                return ResponseEntity.ok(Map.of("mensaje", "Ciudad actualizada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La ciudad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo actualizar la ciudad: " + e.getMessage()));
        }
    }

    // ==========================================
    //      5. ELIMINAR CIUDAD (DELETE)
    // ==========================================
    @DeleteMapping("/ciudades/{id}")
    public ResponseEntity<?> eliminarCiudad(@PathVariable Integer id) {
        try {
            if (ciudadRepository.existsById(id)) {
                ciudadRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("mensaje", "Ciudad eliminada correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La ciudad con ID " + id + " no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo eliminar la ciudad porque está en uso o no existe."));
        }
    }

}
