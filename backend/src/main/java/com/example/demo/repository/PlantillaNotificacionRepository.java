package com.example.demo.repository;

import com.example.demo.model.PlantillaNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlantillaNotificacionRepository extends JpaRepository<PlantillaNotificacion, Integer> {
    Optional<PlantillaNotificacion> findByTipoAndActivo(String tipo, Boolean activo);
    List<PlantillaNotificacion> findByActivoOrderByTipo(Boolean activo);
}
