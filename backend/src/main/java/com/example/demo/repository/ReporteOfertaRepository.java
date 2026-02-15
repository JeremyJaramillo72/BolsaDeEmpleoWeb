package com.example.demo.repository;

import com.example.demo.dto.ReporteOfertaDTO;
import com.example.demo.model.OfertaLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReporteOfertaRepository
        extends JpaRepository<OfertaLaboral, Integer> {

    @Query(value = """
        SELECT
            o.id_oferta AS idOferta,
            ce.nombre_empresa AS nombreEmpresa,
            c.nombre_ciudad AS nombreCiudad,
            mo.nombre_modalidad AS nombreModalidad,
            jo.nombre_jornada AS nombreJornada,
            co.nombre_categoria AS nombreCategoria,
            o.salario_promedio AS salarioPromedio
        FROM oferta_laboral o
        INNER JOIN usuario_empresa ue
            ON ue.id_empresa = o.id_empresa
        INNER JOIN catalogo_empresa ce
            ON ce.ruc = ue.ruc
        INNER JOIN ciudad c
            ON c.id_ciudad = o.id_ciudad
        INNER JOIN modalidad_oferta mo
            ON mo.id_modalidad = o.id_modalidad
        INNER JOIN jornada_oferta jo
            ON jo.id_jornada = o.id_jornada
        INNER JOIN categoria_oferta co
            ON co.id_categoria = o.id_categoria
        WHERE (:estado IS NULL OR o.estado_oferta = :estado)
        AND (:categoria IS NULL OR co.nombre_categoria ILIKE CONCAT('%', :categoria, '%'))
        AND (:ciudad IS NULL OR c.nombre_ciudad ILIKE CONCAT('%', :ciudad, '%'))
        ORDER BY o.id_oferta DESC
        """, nativeQuery = true)
    List<ReporteOfertaDTO> obtenerReporteOfertas(
            @Param("estado") String estado,
            @Param("categoria") String categoria,
            @Param("ciudad") String ciudad
    );
}
