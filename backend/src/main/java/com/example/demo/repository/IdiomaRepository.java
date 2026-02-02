package com.example.demo.repository;

import com.example.demo.model.Idioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdiomaRepository extends JpaRepository<Idioma, Integer> {
    // Al extender de JpaRepository, ya tenemos:
    // 1. findAll() -> Para listar todos los idiomas.
    // 2. findById() -> Para buscar un idioma específico.
    // 3. save() -> Para insertar nuevos idiomas si fuera necesario.
}