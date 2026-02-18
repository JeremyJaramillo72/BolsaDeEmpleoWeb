package com.example.demo.repository;

import com.example.demo.dto.IOfertaResumen;
import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.OfertaLaboral;
import com.example.demo.dto.OfertaDetalleDTO;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface OfertaLaboralRepository extends JpaRepository<OfertaLaboral, Integer> {

    List<OfertaLaboral> findByEmpresa(UsuarioEmpresa empresa);

    @Query(value = "SELECT * FROM ofertas.listar_ofertas_por_estado(:estado)", nativeQuery = true)
    List<IOfertaResumen> listarPorEstadoSP(@Param("estado") String estado);

    @Modifying //
    @Query(value = "UPDATE ofertas.oferta_laboral SET estado_oferta = :estado WHERE id_oferta = :id", nativeQuery = true)
    void actualizarEstadoDirecto(@Param("id") Long id, @Param("estado") String estado);

    @Modifying
    @Transactional
    @Query(value = "call ofertas.sp_crearoferta(:p_idempresa, :p_idmodalidad, :p_idcategoria, :p_idjornada, :p_idciudad, :p_titulo, :p_descripcion, :p_salario_min, :p_salario_max, :p_cantidad_vacantes, :p_experiencia_minima, :p_fecha_inicio, :p_fecha_cierre, cast(:p_habilidades as jsonb), cast(:p_requisitos_manuales as jsonb))", nativeQuery = true)
    void registrarOferta(

            @Param("p_idempresa") Long idEmpresa,
            @Param("p_idmodalidad") Integer idModalidad,
            @Param("p_idcategoria") Integer idCategoria,
            @Param("p_idjornada") Integer idJornada,
            @Param("p_idciudad") Integer idCiudad,
            @Param("p_titulo") String titulo,
            @Param("p_descripcion") String descripcion,
            @Param("p_salario_min") BigDecimal salarioMin,
            @Param("p_salario_max") BigDecimal salarioMax,
            @Param("p_cantidad_vacantes") Integer cantidadVacantes,
            @Param("p_experiencia_minima") Integer experienciaMinima,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_cierre") LocalDate fechaCierre,
            @Param("p_habilidades") String habilidadesJson,
            @Param("p_requisitos_manuales") String requisitosJson
    );


    @Modifying
    @Transactional
    @Query(value = "call ofertas.sp_actualizaroferta(:p_idoferta, :p_idmodalidad, :p_idcategoria, :p_idjornada, :p_idciudad, :p_titulo, :p_descripcion, :p_salario_min, :p_salario_max, :p_cantidad_vacantes, :p_experiencia_minima, :p_estado_oferta, :p_fecha_cierre, cast(:p_habilidades as jsonb), cast(:p_requisitos_manuales as jsonb))", nativeQuery = true)
    void actualizarOferta(
            @Param("p_idoferta") Long idOferta,
            @Param("p_idmodalidad") Integer idModalidad,
            @Param("p_idcategoria") Integer idCategoria,
            @Param("p_idjornada") Integer idJornada,
            @Param("p_idciudad") Integer idCiudad,
            @Param("p_titulo") String titulo,
            @Param("p_descripcion") String descripcion,
            @Param("p_salario_min") BigDecimal salarioMin,
            @Param("p_salario_max") BigDecimal salarioMax,
            @Param("p_cantidad_vacantes") Integer cantidadVacantes,
            @Param("p_experiencia_minima") Integer experienciaMinima,
            @Param("p_estado_oferta") String estadoOferta,
            @Param("p_fecha_cierre") LocalDate fechaCierre,
            @Param("p_habilidades") String habilidadesJson,
            @Param("p_requisitos_manuales") String requisitosJson
    );


    @Query(value = "select * from ofertas.fn_mostrarofertasempresa(:idEmpresa)", nativeQuery = true)
    List<IOfertaEmpresaDTO> obtenerOfertasPorEmpresa(@Param("idEmpresa") Long idEmpresa);

    @Query(value = "select * from ofertas.fn_mostrar_postulantes_oferta(:idOferta)", nativeQuery = true)
    List<IPostulanteOfertaDTO> obtenerPostulantesPorOferta(@Param("idOferta") Long idOferta);
}
