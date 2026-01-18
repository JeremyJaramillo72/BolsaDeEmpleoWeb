package com.example.demo.repository;

import com.example.demo.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {
    // Usamos el guion bajo (_) para forzar a Spring a entrar en 'provincia' y buscar 'idProvincia'
    List<Ciudad> findByProvincia_IdProvincia(Integer idProvincia);
}