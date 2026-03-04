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


    @Query("SELECT p.usuario.idUsuario, o.titulo, CONCAT(e.usuario.nombre, ' ', e.usuario.apellido) " +
            "FROM Postulacion p JOIN p.ofertaLaboral o JOIN o.empresa e " +
            "WHERE p.idPostulacion = :idPostulacion")
    List<Object[]> obtenerDatosParaNotificacion(@Param("idPostulacion") Integer idPostulacion);

    @Query("SELECT o.empresa.usuario.idUsuario, o.titulo " +
            "FROM OfertaLaboral o " +
            "WHERE o.idOferta = :idOferta")
    List<Object[]> obtenerDatosEmpresaPorOfertaId(@Param("idOferta") Integer idOferta);

    @Query(value = "SELECT p.id_oferta, COUNT(*) FROM postulaciones.postulacion p WHERE p.id_oferta IN :ids GROUP BY p.id_oferta", nativeQuery = true)
    List<Object[]> contarPorOfertas(@Param("ids") List<Integer> ids);
}
