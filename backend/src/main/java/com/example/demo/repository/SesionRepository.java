package com.example.demo.repository;

import com.example.demo.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    // 1. 🔥 CORREGIDO: Usamos el guion bajo para entrar a la propiedad del objeto
    List<Sesion> findBySeguridad_IdSeguridad(Integer idSeguridad);

    // 2. 🔥 PERFECTO: Este lo arreglaste como un crack
    Optional<Sesion> findTopBySeguridad_IdSeguridadOrderByFechaInicioDesc(Integer idSeguridad);

    // 3. Este está perfecto porque "accion" sigue siendo un String directo en Sesion
    List<Sesion> findByAccion(String accion);
}