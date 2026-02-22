package com.example.demo.repository;

import com.example.demo.model.CatalogoEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogoEmpresaRepository extends JpaRepository<CatalogoEmpresa, Integer> {
}

