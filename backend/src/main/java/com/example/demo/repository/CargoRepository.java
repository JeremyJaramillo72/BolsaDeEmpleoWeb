package com.example.demo.repository;

import com.example.demo.model.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Integer> {
    @Query(value = "select * from catalogos.fn_buscar_cargos(:termino)", nativeQuery = true)
    List<Cargo> buscarCargosPredictivo(@Param("termino") String termino);
}