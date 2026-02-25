package com.example.demo.repository;

import com.example.demo.model.OfertaLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

    @Repository
    public interface ReporteOfertaRepository extends JpaRepository<OfertaLaboral, Long> {

        // Opción A: Función que retorna tabla (Recomendada para Reportes)
        @Query(value = "SELECT * FROM ofertas.fn_reporte_ofertas_dinamico(:idCiudad, :idModalidad, :idCategoria, :idJornada, :fechaDesde, :fechaHasta, :busqueda, :limit, :offset)",
                nativeQuery = true)
        List<Object[]> consultarReporteDinamico(
                @Param("idCiudad") Integer idCiudad,
                @Param("idModalidad") Integer idModalidad,
                @Param("idCategoria") Integer idCategoria,
                @Param("idJornada") Integer idJornada,
                @Param("fechaDesde") LocalDate fechaDesde,
                @Param("fechaHasta") LocalDate fechaHasta,
                @Param("busqueda") String busqueda,
                @Param("limit") Integer limit,
                @Param("offset") Integer offset
        );

        // Opción B: Si fuera un PROCEDIMIENTO real (No recomendado para tablas de reporte)
        // @Procedure(procedureName = "ofertas.sp_generar_reporte")
        // void ejecutarProcesamiento(@Param("id") Long id);
    }