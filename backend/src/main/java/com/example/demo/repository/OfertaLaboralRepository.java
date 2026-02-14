package com.example.demo.repository;

import com.example.demo.model.OfertaLaboral;
import com.example.demo.dto.OfertaDetalleDTO;
import com.example.demo.model.UsuarioEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface OfertaLaboralRepository extends JpaRepository<OfertaLaboral, Integer> {

    List<OfertaLaboral> findByEmpresa(UsuarioEmpresa empresa);

    @Query(value = """
        select sp_crearoferta(
            cast(:idEmpresa as bigint),
            cast(:idModalidad as integer),
            cast(:idCategoria as integer),
            cast(:idJornada as integer),
            cast(:idCiudad as integer),
            :titulo,
            :descripcion,
            cast(:salario as decimal),
            cast(:fechaInicio as date),
            cast(:fechaCierre as date),
            cast(:habilidades as jsonb) 
        )
    """, nativeQuery = true)
    Object registrarOferta( // 👈 Retornamos Object para absorber la fila invisible
                            @Param("idEmpresa") Long idEmpresa,
                            @Param("idModalidad") Integer idModalidad,
                            @Param("idCategoria") Integer idCategoria,
                            @Param("idJornada") Integer idJornada,
                            @Param("idCiudad") Integer idCiudad,
                            @Param("titulo") String titulo,
                            @Param("descripcion") String descripcion,
                            @Param("salario") BigDecimal salario,
                            @Param("fechaInicio") LocalDate fechaInicio,
                            @Param("fechaCierre") LocalDate fechaCierre,
                            @Param("habilidades") String habilidadesJson
    );
}