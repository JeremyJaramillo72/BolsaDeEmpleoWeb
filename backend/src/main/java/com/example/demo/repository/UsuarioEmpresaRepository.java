package com.example.demo.repository;

import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.Views.IEmpresaResumenProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioEmpresaRepository extends JpaRepository<UsuarioEmpresa, Long> {


     @Procedure(procedureName = "empresas.sp_modificarperfilempresa")
     void actualizarDatosEmpresa(
             @Param("p_idempresa") Integer idEmpresa,
             @Param("p_nombreempresa") String nombreEmpresa,
             @Param("p_sitioweb") String sitioWeb,
             @Param("p_descripcion") String descripcion
     );

    @Query(value = "select usuarios.fn_obtener_url_imagen(:idUsuario)", nativeQuery = true)
    String obtenerUrlImagenPorUsuario(@Param("idUsuario") Long idUsuario);

    boolean existsByRuc(String ruc);
        Optional <UsuarioEmpresa> findByUsuario_IdUsuario(long idUsuario);

    @Query(value = "SELECT * FROM empresas.usuario_empresa WHERE id_usuario = :idUsuario", nativeQuery = true)
    UsuarioEmpresa findByIdUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = "SELECT * FROM empresas.v_empresas_admin", nativeQuery = true)
    List<IEmpresaResumenProjection> listarDesdeVista();


    @Query(value = "SELECT * FROM empresas.v_empresas_admin WHERE estado = :estado", nativeQuery = true)
    List<IEmpresaResumenProjection> listarDesdeVistaPorEstado(@Param("estado") String estado);

    // Métodos para Dashboard stats - Contar empresas (total)
    @Query(value = "select empresas.fn_contar_empresas_total()", nativeQuery = true)
    long countAllEmpresas();

    @Query(value = "select empresas.fn_contar_empresas_hoy()", nativeQuery = true)
    long countAllEmpresasToday();

    // Métodos para últimos 7 días
    @Query(value = "select * from empresas.fn_obtener_empresas_ultimos_7_dias()", nativeQuery = true)
    List<Object[]> getLast7Days();

    // Métodos para datos históricos (12 meses)
    @Query(value = "select * from empresas.fn_obtener_empresas_historico()", nativeQuery = true)
    List<Object[]> getHistoric12Months();
}