package com.example.demo.repository;

import com.example.demo.model.OfertaLaboral;
import com.example.demo.dto.OfertaDetalleDTO;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
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
import java.util.Optional;

@Repository
public interface OfertaLaboralRepository extends JpaRepository<OfertaLaboral, Integer> {

    List<OfertaLaboral> findByEmpresa(UsuarioEmpresa empresa);

    @Procedure(name = "ofertas.sp_crearoferta")
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
                            @Param("p_habilidades") String habilidadesJson
    );

    @Query(value = "select * from ofertas.fn_mostrarofertasempresa(:idEmpresa)", nativeQuery = true)
    List<IOfertaEmpresaDTO> obtenerOfertasPorEmpresa(@Param("idEmpresa") Long idEmpresa);
}