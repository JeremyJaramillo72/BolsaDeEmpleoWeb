package com.example.demo.repository;

import com.example.demo.model.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
}

