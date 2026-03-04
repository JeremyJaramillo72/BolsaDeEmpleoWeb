package com.example.demo.service;

import com.example.demo.dto.AuditoriaDTO;
import com.example.demo.dto.ResumenAuditoriaDTO;
import java.util.List;
import java.util.Map;

public interface IAuditoriaService {
    // Usuarios
    List<Map<String, Object>> obtenerTodosUsuarios();
    Map<String, Object> getEstadisticasUsuarios();

    // Auditorías
    List<AuditoriaDTO> getAuditoriasUsuario(Integer idUsuario);
    ResumenAuditoriaDTO getResumenAuditoria(Integer idUsuario);

    List<AuditoriaDTO> getAuditoriasUsuarioPorTipo(Integer idUsuario, String tipo);
    List<Map<String, Object>> getSesiones();

    // Exportar
    byte[] exportarUsuariosExcel(Map<String, Object> body);
    byte[] exportarAuditoriasExcel(Integer idUsuario);
    byte[] exportarAuditoriasExcelPorTipo(Integer idUsuario, String tipo);

    // Exportar PDF filtrado por tipo
    byte[] exportarAuditoriasPdfPorTipo(Integer idUsuario, String tipo);


}