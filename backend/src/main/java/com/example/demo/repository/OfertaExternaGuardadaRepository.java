package com.example.demo.repository;

import com.example.demo.model.OfertaExternaGuardada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfertaExternaGuardadaRepository extends JpaRepository<OfertaExternaGuardada, Integer> {
    Optional<OfertaExternaGuardada> findByExternalOfferId(String externalOfferId);
}

