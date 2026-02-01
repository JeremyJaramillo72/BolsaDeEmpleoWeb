package com.example.demo.repository;

import com.example.demo.model.Facultad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultadRepository extends JpaRepository<Facultad, Integer> {
    // Al extender de JpaRepository, ya tienes métodos como:
    // findAll(), findById(), save(), delete(), etc.
}