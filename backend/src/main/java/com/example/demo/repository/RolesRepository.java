package com.example.demo.repository;

import com.example.demo.model.Roles; // Verifica que tu clase Entidad se llame Roles
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {
    // Aquí ya tienes save, findAll, deleteById, etc.
}