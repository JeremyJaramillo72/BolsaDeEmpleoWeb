package com.example.demo.repository;

import com.example.demo.model.HistorialOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialOfertaRepository extends JpaRepository<HistorialOferta, Long> {

    // Llama a la función de ofertas únicas (pasaremos un "{}" desde el Service)
    @Query(value = "SELECT * FROM ofertas.fn_obtener_ofertas_unicas_historial(CAST(:json AS json))", nativeQuery = true)
    List<Object[]> obtenerResumenAuditoriaObj(@Param("json") String json);

    // Llama a la función de trazabilidad enviando el ID en el JSON
    @Query(value = "SELECT * FROM ofertas.fn_obtener_trazabilidad_oferta(CAST(:json AS json))", nativeQuery = true)
    List<Object[]> obtenerTrazabilidadPorOfertaObj(@Param("json") String json);
}