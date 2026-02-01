package com.example.demo.repository;

import com.example.demo.model.OfertaLaboral;
import com.example.demo.dto.OfertaDetalleDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public interface OfertaLaboralRepository extends JpaRepository<OfertaLaboral, Long> {

    @Procedure(name = "OfertaLaboral.obtenerMayorSalario") //
    Map<String, Object> obtenerOfertaMayorSalario(@Param("pid_empresa") Integer idEmpresa);
}