package com.example.demo.repository;

import com.example.demo.model.CatalogoHabilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoHabilidadRepository extends JpaRepository<CatalogoHabilidad, Integer> {

        List<CatalogoHabilidad> findByTipoHabilidad_IdTipoHabilidad(Integer idTipo);

}
