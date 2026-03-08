package com.example.demo.repository;

import com.example.demo.model.CatalogoEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoEmpresaRepository extends JpaRepository<CatalogoEmpresa, Integer> {

    @Query(value = "select * from empresas.fn_buscar_empresas(:termino)", nativeQuery = true)
    List<CatalogoEmpresa> buscarEmpresasPredictivo(@Param("termino") String termino);
}

