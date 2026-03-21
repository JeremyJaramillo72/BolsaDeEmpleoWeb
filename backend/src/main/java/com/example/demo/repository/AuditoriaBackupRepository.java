package com.example.demo.repository;
import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

// Nota: Puedes heredar de la entidad que prefieras, Hibernate solo necesita esto para el contexto
@Repository
public interface AuditoriaBackupRepository extends JpaRepository<Usuario, Long> {

    @Query(value = "SELECT * FROM seguridad.fn_obtener_resumen_auditoria_backups(CAST(:parametros AS JSON))", nativeQuery = true)
    List<Object[]> obtenerResumenAuditoriaBD(@Param("parametros") String parametros);

    @Query(value = "SELECT * FROM seguridad.fn_obtener_detalle_auditoria_backups(CAST(:parametros AS JSON))", nativeQuery = true)
    List<Object[]> obtenerDetalleAuditoriaBD(@Param("parametros") String parametros);
}