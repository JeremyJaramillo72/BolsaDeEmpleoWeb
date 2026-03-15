package com.example.demo.repository;

import com.example.demo.model.SistemaEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SistemaEmpresaRepository extends JpaRepository<SistemaEmpresa, Integer> {

    // ── Actualizar datos generales ────────────────────────────────────────
    // CAST(:datos AS jsonb) en lugar de ::jsonb — JPA interpreta :: como
    // inicio de parámetro y lanza error. CAST() es equivalente y seguro.
    @Modifying
    @Transactional
    @Query(value = "CALL seguridad.sp_actualizar_config_sistema(CAST(:datos AS jsonb))",
            nativeQuery = true)
    void actualizarConfiguracion(@Param("datos") String datosJson);

    // ── Actualizar solo el logo ───────────────────────────────────────────
    @Modifying
    @Transactional
    @Query(value = "CALL seguridad.sp_actualizar_logo_sistema(CAST(:datos AS jsonb))",
            nativeQuery = true)
    void actualizarLogo(@Param("datos") String datosJson);
}