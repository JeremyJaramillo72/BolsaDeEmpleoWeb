package com.example.demo.repository;

import com.example.demo.model.UsuarioImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioImagenRepository extends JpaRepository<UsuarioImagen, Integer> {
}