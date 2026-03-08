package com.example.demo.repository;



import com.example.demo.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    // 1. Para obtener el historial completo de sesiones de un usuario
    List<Sesion> findByIdSeguridad(Integer idSeguridad);

    // 2. 🔥 LA CLAVE PARA BLOQUEAR EL LOGIN 🔥
    // Este método trae automáticamente el registro más reciente de ese usuario
    Optional<Sesion> findTopByIdSeguridadOrderByFechaInicioDesc(Integer idSeguridad);

    // 3. Por si luego necesitas listar en el admin solo las sesiones 'ACTIVA' o 'CERRADA'
    List<Sesion> findByAccion(String accion);
}