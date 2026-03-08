package com.example.demo.repository;

import com.example.demo.model.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PostulacionRepository extends JpaRepository<Postulacion, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL postulaciones.sp_registrar_postulacion(:idUsuario, :idOferta, :urlCv)", nativeQuery = true)
    void registrarPostulacionPro(
            @Param("idUsuario") Long idUsuario,
            @Param("idOferta") Integer idOferta,
            @Param("urlCv") String urlCv
    );

    @Transactional
    @Modifying
    @Query(value = "CALL postulaciones.sp_cancelar_postulacion(:idPostulacion)", nativeQuery = true)
    void cancelarPostulacionPro(@Param("idPostulacion") Integer idPostulacion);

    @Query(value = "SELECT postulaciones.fn_obtener_url_cv(:idPostulacion)", nativeQuery = true)
    String obtenerUrlCvFn(@Param("idPostulacion") Integer idPostulacion);

    @Query(value = "SELECT * FROM postulaciones.fn_datos_notificacion_postulacion(:idPostulacion)", nativeQuery = true)
    List<Object[]> obtenerDatosParaNotificacion(@Param("idPostulacion") Integer idPostulacion);

    @Query("SELECT o.empresa.usuario.idUsuario, o.titulo FROM OfertaLaboral o WHERE o.idOferta = :idOferta")
    List<Object[]> obtenerDatosEmpresaPorOfertaId(@Param("idOferta") Integer idOferta);

    @Query(value = "SELECT * FROM postulaciones.fn_contar_postulantes_por_ofertas(:ids)", nativeQuery = true)
    List<Object[]> contarPorOfertas(@Param("ids") Integer[] ids);

    // Métodos para Dashboard stats
    @Query("SELECT COUNT(p) FROM Postulacion p WHERE p.usuario.idUsuario = :idUsuario")
    long countByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT COUNT(*) FROM postulaciones.postulacion WHERE id_usuario = :idUsuario AND DATE(fecha_postulacion) = CURRENT_DATE", nativeQuery = true)
    long countByUsuarioToday(@Param("idUsuario") Long idUsuario);

    @Query("SELECT COUNT(p) FROM Postulacion p WHERE p.ofertaLaboral.empresa.idEmpresa = :idEmpresa")
    long countByEmpresa(@Param("idEmpresa") Long idEmpresa);

    @Query(value = "SELECT COUNT(*) FROM postulaciones.postulacion p JOIN ofertas.oferta_laboral o ON p.id_oferta = o.id_oferta WHERE o.id_empresa = :idEmpresa AND DATE(p.fecha_postulacion) = CURRENT_DATE", nativeQuery = true)
    long countByEmpresaToday(@Param("idEmpresa") Long idEmpresa);

    @Query("SELECT COUNT(p) FROM Postulacion p WHERE p.ofertaLaboral.empresa.idEmpresa = :idEmpresa AND p.estadoValidacion = :estado")
    long countByEmpresaAndEstado(@Param("idEmpresa") Long idEmpresa, @Param("estado") String estado);

    @Query("SELECT COUNT(p) FROM Postulacion p WHERE p.usuario.idUsuario = :idUsuario AND p.estadoValidacion = :estado")
    long countByUsuarioAndEstado(@Param("idUsuario") Long idUsuario, @Param("estado") String estado);

    // Métodos para datos de últimos 7 días
    @Query(value = "SELECT CAST(p.fecha_postulacion AS DATE) as fecha, COUNT(*) as count FROM postulaciones.postulacion p WHERE p.id_usuario = :idUsuario AND p.fecha_postulacion >= CURRENT_DATE - INTERVAL '7 days' GROUP BY CAST(p.fecha_postulacion AS DATE) ORDER BY fecha ASC", nativeQuery = true)
    List<Object[]> getLast7DaysByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT CAST(p.fecha_postulacion AS DATE) as fecha, COUNT(*) as count FROM postulaciones.postulacion p JOIN ofertas.oferta_laboral o ON p.id_oferta = o.id_oferta WHERE o.id_empresa = :idEmpresa AND p.fecha_postulacion >= CURRENT_DATE - INTERVAL '7 days' GROUP BY CAST(p.fecha_postulacion AS DATE) ORDER BY fecha ASC", nativeQuery = true)
    List<Object[]> getLast7DaysByEmpresa(@Param("idEmpresa") Long idEmpresa);

    // Métodos para datos históricos (12 meses)
    @Query(value = "SELECT TO_CHAR(p.fecha_postulacion, 'YYYY-MM') AS yearMonth, COUNT(*) as count FROM postulaciones.postulacion p WHERE p.id_usuario = :idUsuario AND p.fecha_postulacion >= '2026-01-01'::date GROUP BY TO_CHAR(p.fecha_postulacion, 'YYYY-MM') ORDER BY yearMonth ASC", nativeQuery = true)
    List<Object[]> getHistoric12MonthsByUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT TO_CHAR(p.fecha_postulacion, 'YYYY-MM') AS yearMonth, COUNT(*) as count FROM postulaciones.postulacion p JOIN ofertas.oferta_laboral o ON p.id_oferta = o.id_oferta WHERE o.id_empresa = :idEmpresa AND p.fecha_postulacion >= '2026-01-01'::date GROUP BY TO_CHAR(p.fecha_postulacion, 'YYYY-MM') ORDER BY yearMonth ASC", nativeQuery = true)
    List<Object[]> getHistoric12MonthsByEmpresa(@Param("idEmpresa") Long idEmpresa);

    // Métodos para obtener categorías de ofertas distintas de una empresa
    @Query(value = "select * from postulaciones.fn_obtener_categorias_empresa(:idEmpresa)", nativeQuery = true)
    List<String> getCategoriasByEmpresa(@Param("idEmpresa") Long idEmpresa);
}
