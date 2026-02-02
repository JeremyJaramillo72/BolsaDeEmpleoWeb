package com.example.demo.controller;

import com.example.demo.model.Facultad;
import com.example.demo.model.Carrera;
import com.example.demo.model.Idioma;
import com.example.demo.repository.FacultadRepository;
import com.example.demo.repository.CarreraRepository;
import com.example.demo.repository.IdiomaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academico")
@CrossOrigin(origins = "*") // 👈 Permite que Angular (puerto 4200) se conecte
public class AcademicController {

    @Autowired
    private FacultadRepository facultadRepository;
    @Autowired
    private CarreraRepository carreraRepository;
    @Autowired
    private IdiomaRepository idiomaRepository;
    //Devuelve la lista de todas las facultades registras en mi BD
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
}