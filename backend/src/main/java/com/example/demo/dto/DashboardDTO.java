package com.example.demo.dto;

import java.util.List;
import java.util.Map;
import lombok.Data;

public class DashboardDTO {

    @Data
    public static class KpiItem {
        private Integer total;                  // Total acumulado
        private Integer totalHoy;               // Total agregado hoy
        private Double porcentajeCambio;        // Porcentaje de cambio: (totalHoy / totalAntes) * 100
        private List<Integer> datosUltimos7Dias;   // Datos últimos 7 días para mini-gráfico
        private List<String> labels7Dias;      // Labels últimos 7 días (D-6, D-5, ..., Hoy)
        private List<Integer> datosHistoricos;     // Todos los datos históricos para línea principal
        private List<String> labelsHistoricos;     // Labels históricos (fechas)
    }

    @Data
    public static class AdminStats {
        private Map<String, KpiItem> kpis; // pendientes, empresasNuevas, usuariosTotales, reportesHoy
        private GraficoDTO grafico;        // Mantener para compatibilidad si se necesita
    }

    @Data
    public static class EmpresaStats {
        private Map<String, KpiItem> kpis; // activas, postulaciones, enRevision, notificaciones
        private GraficoDTO grafico;
    }

    @Data
    public static class PostulanteStats {
        private Map<String, KpiItem> kpis; // misPostulaciones, enProceso, guardadas, alertas
        private GraficoDTO grafico;
    }

    @Data
    public static class GraficoDTO {
        private List<String> labels;
        private List<Integer> data;
    }
}