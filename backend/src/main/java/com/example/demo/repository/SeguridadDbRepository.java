package com.example.demo.repository;

import com.example.demo.model.Seguridad;
import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeguridadDbRepository extends JpaRepository<Seguridad, Integer> {
    Optional<Seguridad> findByUsuario(Usuario usuario);
}