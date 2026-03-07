package com.example.demo.service;

import com.example.demo.dto.DashboardDTO.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired(required = false)
    private OfertaLaboralRepository ofertaLaboralRepository;

    @Autowired(required = false)
    private PostulacionRepository postulacionRepository;

    @Autowired(required = false)
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private NotificacionRepository notificacionRepository;

    @Autowired(required = false)
    private OfertasFavoritasRepository ofertasFavoritasRepository;

    public AdminStats getAdminStats() {
        AdminStats stats = new AdminStats();

        // Crear KPIs con estructura nueva
        Map<String, KpiItem> kpis = new LinkedHashMap<>();

        // KPI: Ofertas Pendientes
        kpis.put("pendientes", crearKpiPendientesAdmin());

        // KPI: Nuevas Empresas
        kpis.put("empresasNuevas", crearKpiEmpresasNuevasAdmin());

        // KPI: Usuarios Totales
        kpis.put("usuariosTotales", crearKpiUsuariosTotalesAdmin());

        // KPI: Reportes Hoy
        kpis.put("reportesHoy", crearKpiReportesHoyAdmin());

        stats.setKpis(kpis);

        // Gráfico principal: Línea de tendencia histórica de ofertas pendientes
        GraficoDTO grafico = new GraficoDTO();
        grafico.setLabels(generarLabelsHistoricos());
        grafico.setData(generarDatosHistoricosPendientes());
        stats.setGrafico(grafico);

        return stats;
    }

    public EmpresaStats getEmpresaStats(Long idEmpresa) {
        EmpresaStats stats = new EmpresaStats();

        Map<String, KpiItem> kpis = new LinkedHashMap<>();

        // KPI: Ofertas Activas
        kpis.put("activas", crearKpiOfertasActivas(idEmpresa));

        // KPI: Total Postulaciones
        kpis.put("postulaciones", crearKpiTotalPostulaciones(idEmpresa));

        // KPI: En Revisión
        kpis.put("enRevision", crearKpiEnRevision(idEmpresa));

        // KPI: Notificaciones
        kpis.put("notificaciones", crearKpiNotificacionesEmpresa(idEmpresa));

        stats.setKpis(kpis);

        // Gráfico principal: Línea de postulaciones por oferta
        GraficoDTO grafico = new GraficoDTO();
        grafico.setLabels(Arrays.asList("Dev Java", "Analista", "Soporte", "Diseñador"));
        grafico.setData(generarDatosHistoricosPostulaciones());
        stats.setGrafico(grafico);

        return stats;
    }

    public PostulanteStats getPostulanteStats(Long idUsuario) {
        PostulanteStats stats = new PostulanteStats();

        Map<String, KpiItem> kpis = new LinkedHashMap<>();

        // KPI: Mis Postulaciones
        kpis.put("misPostulaciones", crearKpiMisPostulaciones(idUsuario));

        // KPI: En Proceso
        kpis.put("enProceso", crearKpiEnProceso(idUsuario));

        // KPI: Guardadas
        kpis.put("guardadas", crearKpiGuardadas(idUsuario));

        // KPI: Alertas
        kpis.put("alertas", crearKpiAlertas(idUsuario));

        stats.setKpis(kpis);

        // Gráfico principal: Línea de postulaciones a lo largo del tiempo
        GraficoDTO grafico = new GraficoDTO();
        grafico.setLabels(generarLabelsHistoricos());
        grafico.setData(generarDatosHistoricosMisPostulaciones());
        stats.setGrafico(grafico);

        return stats;
    }

    // ==================== ADMIN KPIs ====================
    private KpiItem crearKpiPendientesAdmin() {
        KpiItem kpi = new KpiItem();

        // Contar ofertas pendientes
        long total = ofertaLaboralRepository.countByEstadoOferta("PENDIENTE");
        long totalHoy = ofertaLaboralRepository.countByEstadoOfertaToday("PENDIENTE");

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = ofertaLaboralRepository.getLast7DaysByEstado("PENDIENTE");
        List<Object[]> datosHistoricos = ofertaLaboralRepository.getHistoric12MonthsByEstado("PENDIENTE");

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiEmpresasNuevasAdmin() {
        KpiItem kpi = new KpiItem();

        // Contar empresas (usuarios con rol EMPRESA)
        long total = usuarioRepository.countByRolName("EMPRESA");
        long totalHoy = usuarioRepository.countByRolNameToday("EMPRESA");

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = usuarioRepository.getLast7DaysByRol("EMPRESA");
        List<Object[]> datosHistoricos = usuarioRepository.getHistoric12MonthsByRol("EMPRESA");

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiUsuariosTotalesAdmin() {
        KpiItem kpi = new KpiItem();

        // Contar todos los usuarios
        long total = usuarioRepository.countAllUsuarios();
        long totalHoy = usuarioRepository.countAllUsuariosToday();

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = usuarioRepository.getLast7DaysAllUsers();
        List<Object[]> datosHistoricos = usuarioRepository.getHistoric12MonthsAllUsers();

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiReportesHoyAdmin() {
        KpiItem kpi = new KpiItem();
        kpi.setTotal(45);
        kpi.setTotalHoy(12);
        kpi.setDatosUltimos7Dias(Arrays.asList(8, 10, 5, 12, 7, 6, 12));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(generarDatosHistoricosReportes());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje(12, 33));
        return kpi;
    }

    private KpiItem crearKpiOfertasActivas(Long idEmpresa) {
        KpiItem kpi = new KpiItem();

        // Contar ofertas activas
        long total = ofertaLaboralRepository.countByEmpresaAndEstado(idEmpresa, "ACTIVA");
        long totalHoy = ofertaLaboralRepository.countByEmpresaEstadoToday(idEmpresa, "ACTIVA");

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = ofertaLaboralRepository.getLast7DaysByEmpresaAndEstado(idEmpresa, "ACTIVA");
        List<Object[]> datosHistoricos = ofertaLaboralRepository.getHistoric12MonthsByEmpresaAndEstado(idEmpresa, "ACTIVA");

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiTotalPostulaciones(Long idEmpresa) {
        KpiItem kpi = new KpiItem();

        // Contar postulaciones por empresa
        long total = postulacionRepository.countByEmpresa(idEmpresa);
        long totalHoy = postulacionRepository.countByEmpresaToday(idEmpresa);

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = postulacionRepository.getLast7DaysByEmpresa(idEmpresa);
        List<Object[]> datosHistoricos = postulacionRepository.getHistoric12MonthsByEmpresa(idEmpresa);

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiEnRevision(Long idEmpresa) {
        KpiItem kpi = new KpiItem();

        // Contar postulaciones en revisión
        long total = postulacionRepository.countByEmpresaAndEstado(idEmpresa, "EN_REVISION");
        // Para today, asumimos que el estado puede cambiar, usamos la condición general
        long totalHoy = 0; // No hay un campo de fecha de estado, así que 0 por ahora

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(Arrays.asList(2, 3, 2, 4, 2, 3, 3)); // Mock para ahora
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(generarDatosHistoricosEnRevision());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio((double) (total > 0 ? 0 : 0));
        return kpi;
    }

    private KpiItem crearKpiNotificacionesEmpresa(Long idEmpresa) {
        KpiItem kpi = new KpiItem();
        kpi.setTotal(12);
        kpi.setTotalHoy(2);
        kpi.setDatosUltimos7Dias(Arrays.asList(1, 2, 1, 2, 1, 3, 2));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(generarDatosHistoricosNotificaciones());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje(2, 10));
        return kpi;
    }

    // ==================== POSTULANTE KPIs ====================
    private KpiItem crearKpiMisPostulaciones(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar postulaciones del usuario
        long total = postulacionRepository.countByUsuario(idUsuario);
        long totalHoy = postulacionRepository.countByUsuarioToday(idUsuario);

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = postulacionRepository.getLast7DaysByUsuario(idUsuario);
        List<Object[]> datosHistoricos = postulacionRepository.getHistoric12MonthsByUsuario(idUsuario);

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiEnProceso(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar postulaciones en proceso (estado Pendiente)
        long total = postulacionRepository.countByUsuarioAndEstado(idUsuario, "Pendiente");
        long totalHoy = postulacionRepository.countByUsuarioAndEstado(idUsuario, "Pendiente"); // No hay distinción de today aquí

        kpi.setTotal((int) total);
        kpi.setTotalHoy(0); // No se puede distinguir por fecha de estado
        kpi.setDatosUltimos7Dias(Arrays.asList(0, 1, 0, 1, 0, 0, 1)); // Mock para ahora
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(generarDatosHistoricosEnProceso());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio((double) 0);
        return kpi;
    }

    private KpiItem crearKpiGuardadas(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar ofertas guardadas (favoritas)
        long total = ofertasFavoritasRepository.countByUsuario(idUsuario);
        long totalHoy = 0; // OfertasFavoritas no tiene campo de fecha

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(Arrays.asList(2, 3, 2, 4, 2, 3, 3)); // Mock para ahora
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(generarDatosHistoricosGuardadas());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio((double) 0); // No hay fecha en favoritas
        return kpi;
    }

    private KpiItem crearKpiAlertas(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar notificaciones (alertas) del usuario
        long total = notificacionRepository.countByUsuario(idUsuario);
        long totalHoy = notificacionRepository.countByUsuarioToday(idUsuario);

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = notificacionRepository.getLast7DaysByUsuario(idUsuario);
        List<Object[]> datosHistoricos = notificacionRepository.getHistoric12MonthsByUsuario(idUsuario);

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    // ==================== HELPERS ====================
    private Double calculaoPorcentaje(Integer hoy, Integer antes) {
        if (antes == 0) return 0.0;
        return (double) (hoy * 100) / antes;
    }

    private List<String> generarLabels7Dias() {
        List<String> labels = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate fecha = LocalDate.now().minusDays(i);
            String diaSemana = switch (fecha.getDayOfWeek().getValue()) {
                case 1 -> "Lun";
                case 2 -> "Mar";
                case 3 -> "Mié";
                case 4 -> "Jue";
                case 5 -> "Vie";
                case 6 -> "Sab";
                case 7 -> "Dom";
                default -> "";
            };
            labels.add(diaSemana);
        }
        return labels;
    }

    private List<String> generarLabelsHistoricos() {
        List<String> labels = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate fecha = LocalDate.now().minusMonths(i);
            labels.add(fecha.getMonth().toString().substring(0, 3) + " " + fecha.getYear());
        }
        return labels;
    }

    // Métodos auxiliares para generar datos históricos por tipo
    private List<Integer> generarDatosHistoricosPendientes() {
        return Arrays.asList(5, 6, 7, 6, 8, 7, 6, 8, 9, 8, 7, 8);
    }

    private List<Integer> generarDatosHistoricosEmpresas() {
        return Arrays.asList(25, 28, 30, 32, 35, 38, 40, 41, 43, 44, 45, 45);
    }

    private List<Integer> generarDatosHistoricosUsuarios() {
        return Arrays.asList(95, 100, 105, 110, 118, 125, 135, 140, 145, 148, 150, 150);
    }

    private List<Integer> generarDatosHistoricosReportes() {
        return Arrays.asList(25, 28, 32, 35, 38, 40, 42, 45, 48, 50, 52, 61);
    }

    private List<Integer> generarDatosHistoricosOfertasActivas() {
        return Arrays.asList(8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12);
    }

    private List<Integer> generarDatosHistoricosPostulacionesEmpresa() {
        return Arrays.asList(20, 22, 25, 28, 32, 38, 42, 45, 48, 50, 55, 62);
    }

    private List<Integer> generarDatosHistoricosEnRevision() {
        return Arrays.asList(12, 13, 14, 16, 18, 19, 20, 21, 22, 23, 23, 23);
    }

    private List<Integer> generarDatosHistoricosNotificaciones() {
        return Arrays.asList(8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 15, 18);
    }

    private List<Integer> generarDatosHistoricosMisPostulaciones() {
        return Arrays.asList(5, 6, 7, 8, 9, 10, 11, 12, 12, 12, 12, 12);
    }

    private List<Integer> generarDatosHistoricosEnProceso() {
        return Arrays.asList(1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3);
    }

    private List<Integer> generarDatosHistoricosGuardadas() {
        return Arrays.asList(10, 12, 14, 16, 18, 19, 20, 21, 22, 23, 24, 25);
    }

    private List<Integer> generarDatosHistoricosAlertas() {
        return Arrays.asList(4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8);
    }

    private List<Integer> generarDatosHistoricosPostulaciones() {
        return Arrays.asList(15, 18, 22, 25, 28, 32, 35, 38, 42, 48, 55, 62);
    }

    // ==================== MÉTODOS AUXILIARES PARA PROCESAR DATOS REALES ====================

    /**
     * Procesa datos de últimos 7 días desde la BD y retorna una lista de counts
     * Rellena los días faltantes con 0
     */
    private List<Integer> procesarLast7Days(List<Object[]> dbData) {
        List<Integer> result = new ArrayList<>();
        Map<String, Integer> dataMap = new HashMap<>();

        // Procesar datos de BD: Object[0] = fecha/timestamp, Object[1] = count
        for (Object[] row : dbData) {
            String dateStr = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            dataMap.put(dateStr, count.intValue());
        }

        // Generar los últimos 7 días y rellenar con 0 si no hay datos
        for (int i = 6; i >= 0; i--) {
            LocalDate fecha = LocalDate.now().minusDays(i);
            String fechaStr = fecha.toString();
            result.add(dataMap.getOrDefault(fechaStr, 0));
        }

        return result;
    }

    /**
     * Procesa datos históricos (12 meses) desde la BD y retorna una lista de counts
     * Asegura exactamente 12 meses, rellenando con 0 si es necesario
     */
    private List<Integer> procesarHistoric12Months(List<Object[]> dbData) {
        List<Integer> result = new ArrayList<>();
        Map<String, Integer> dataMap = new HashMap<>();

        // Procesar datos de BD: Object[0] = yearMonth (ej: "2025-01"), Object[1] = count
        for (Object[] row : dbData) {
            String yearMonth = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            dataMap.put(yearMonth, count.intValue());
        }

        // Generar los últimos 12 meses y rellenar con 0 si no hay datos
        for (int i = 11; i >= 0; i--) {
            LocalDate fecha = LocalDate.now().minusMonths(i);
            String yearMonth = String.format("%d-%02d", fecha.getYear(), fecha.getMonthValue());
            result.add(dataMap.getOrDefault(yearMonth, 0));
        }

        return result;
    }
}