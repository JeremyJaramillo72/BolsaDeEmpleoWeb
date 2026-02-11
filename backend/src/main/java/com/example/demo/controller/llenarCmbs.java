package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academico")
@CrossOrigin(origins = "*") // 👈 Permite que Angular (puerto 4200) se conecte
public class llenarCmbs {

    @Autowired
    private FacultadRepository facultadRepository;
    @Autowired
    private CarreraRepository carreraRepository;
    @Autowired
    private IdiomaRepository idiomaRepository;

    @Autowired
    private CategoriaOfertaRepository categoriaRepository;

    @Autowired
    private JornadaOfertaRepository jornadaRepository; // Inyecta tu repositorio

    @Autowired
    private ModalidadOfertaRepository modalidadRepository;


    @GetMapping("/facultades")
    public List<Facultad> listarFacultades() {
        return facultadRepository.findAll();
    }
    //Devuelve la lista de todas las carreras registras en mi BD


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





}