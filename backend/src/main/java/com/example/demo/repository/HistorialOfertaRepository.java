package com.example.demo.repository;

import com.example.demo.model.HistorialOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialOfertaRepository extends JpaRepository<HistorialOferta, Long> {

    // Cambiamos el retorno a List<Object[]>
    @Query(value = "SELECT " +
            "    ho.id_historial, " +
            "    ho.id_oferta, " +
            "    ol.titulo, " +
            "    COALESCE(ce.nombre_empresa, u.nombre || ' ' || u.apellido), " +
            "    COALESCE(s.login_name, 'Sistema'), " +
            "    ho.accion, " +
            "    ol.estado_oferta, " +
            "    ho.fecha_hora " +
            "FROM ofertas.historial_oferta ho " +
            "INNER JOIN ofertas.oferta_laboral ol ON ho.id_oferta = ol.id_oferta " +
            "LEFT JOIN seguridad.seguridad s ON ho.id_seguridad = s.id_seguridad " +
            "LEFT JOIN empresas.usuario_empresa ue ON ol.id_empresa = ue.id_empresa " +
            "LEFT JOIN empresas.catalogo_empresa ce ON ue.ruc = ce.ruc " +
            "LEFT JOIN usuarios.usuario u ON ue.id_usuario = u.id_usuario " +
            "ORDER BY ho.fecha_hora DESC", nativeQuery = true)
    List<Object[]> obtenerResumenAuditoriaObj();

    List<HistorialOferta> findByOferta_IdOfertaOrderByFechaHoraDesc(Long idOferta);
}