package com.example.demo.service;

import com.example.demo.dto.DashboardDTO;
import com.example.demo.dto.DashboardDTO.AdminStats;
import com.example.demo.dto.DashboardDTO.EmpresaStats;
import com.example.demo.dto.DashboardDTO.PostulanteStats;
import com.example.demo.dto.DashboardDTO.KpiItem;
import com.example.demo.dto.DashboardDTO.GraficoDTO;
import com.example.demo.dto.DashboardDTO.GraficoMultiDatasetDTO;
import com.example.demo.dto.DashboardDTO.GraficoDataset;
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

    @Autowired(required = false)
    private UsuarioEmpresaRepository usuarioEmpresaRepository;

    @Autowired(required = false)
    private AuditoriaRepository auditoriaRepository;

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

        // Gráfico principal: Tendencia de Auditorías (multi-línea con top 4-5 usuarios)
        // Note: Using GraficoDTO wrapper with special handling on frontend for multi-dataset
        GraficoDTO grafico = new GraficoDTO();
        grafico.setLabels(generarLabelsHistoricos());
        // We'll pass multi-dataset data as string in the data field and let frontend parse it
        // For now, this is a placeholder - frontend will receive graficoMultiDataset instead
        stats.setGrafico(grafico);
        stats.setGraficoMultiDataset(procesarAuditoriaTopUsuarios(auditoriaRepository.getTopUsersAuditHistoric()));

        return stats;
    }

    public EmpresaStats getEmpresaStats(Long idEmpresa) {
        EmpresaStats stats = new EmpresaStats();

        Map<String, KpiItem> kpis = new LinkedHashMap<>();

        // KPI: Ofertas Aprobadas
        kpis.put("aprobadas", crearKpiOfertasAprobadas(idEmpresa));

        // KPI: Total Postulaciones
        kpis.put("postulaciones", crearKpiTotalPostulaciones(idEmpresa));

        // KPI: En Revisión
        kpis.put("enRevision", crearKpiEnRevision(idEmpresa));

        // KPI: Notificaciones
        kpis.put("notificaciones", crearKpiNotificacionesEmpresa(idEmpresa));

        stats.setKpis(kpis);

        // Gráfico principal: Postulaciones por categoría de oferta
        GraficoDTO grafico = new GraficoDTO();

        // Obtener categorías distintas de las ofertas de la empresa
        List<String> categorias = postulacionRepository.getCategoriasByEmpresa(idEmpresa);
        if (categorias.isEmpty()) {
            categorias = Arrays.asList("Sin ofertas");
        }

        grafico.setLabels(categorias);
        grafico.setData(procesarHistoric12Months(postulacionRepository.getHistoric12MonthsByEmpresa(idEmpresa)));
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
        grafico.setData(procesarHistoric12Months(postulacionRepository.getHistoric12MonthsByUsuario(idUsuario)));
        stats.setGrafico(grafico);

        return stats;
    }

    // ==================== ADMIN KPIs ====================
    private KpiItem crearKpiPendientesAdmin() {
        KpiItem kpi = new KpiItem();

        // Contar ofertas pendientes (ofertas.oferta_laboral usa "pendiente" en minúsculas)
        long total = ofertaLaboralRepository.countByEstadoOferta("pendiente");
        long totalHoy = ofertaLaboralRepository.countByEstadoOfertaToday("pendiente");

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = ofertaLaboralRepository.getLast7DaysByEstado("pendiente");
        List<Object[]> datosHistoricos = ofertaLaboralRepository.getHistoric12MonthsByEstado("pendiente");

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

        // Contar empresas totales (desde tabla usuario_empresa)
        long total = usuarioEmpresaRepository.countAllEmpresas();
        long totalHoy = usuarioEmpresaRepository.countAllEmpresasToday();

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = usuarioEmpresaRepository.getLast7Days();
        List<Object[]> datosHistoricos = usuarioEmpresaRepository.getHistoric12Months();

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

        // Contar auditorías totales y de hoy
        long total = auditoriaRepository.countAll();
        long totalHoy = auditoriaRepository.countToday();

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = auditoriaRepository.getLast7Days();
        List<Object[]> datosHistoricos = auditoriaRepository.getHistoric12Months();

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiOfertasAprobadas(Long idEmpresa) {
        KpiItem kpi = new KpiItem();

        // Contar ofertas aprobadas (ofertas.oferta_laboral usa "aprobado" en minúsculas)
        long total = ofertaLaboralRepository.countByEmpresaAndEstado(idEmpresa, "aprobado");
        long totalHoy = ofertaLaboralRepository.countByEmpresaEstadoToday(idEmpresa, "aprobado");

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = ofertaLaboralRepository.getLast7DaysByEmpresaAndEstado(idEmpresa, "aprobado");
        List<Object[]> datosHistoricos = ofertaLaboralRepository.getHistoric12MonthsByEmpresaAndEstado(idEmpresa, "aprobado");

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

        // Contar postulaciones en revisión/pendiente (postulaciones.postulacion)
        long total = postulacionRepository.countByEmpresaAndEstado(idEmpresa, "Pendiente");
        long totalHoy = 0; // No hay un campo de fecha de estado en postulaciones

        // Datos reales desde BD
        List<Object[]> datos7Dias = new ArrayList<>();
        List<Object[]> datosHistoricos = new ArrayList<>();

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio((double) 0);
        return kpi;
    }

    private KpiItem crearKpiNotificacionesEmpresa(Long idEmpresa) {
        KpiItem kpi = new KpiItem();

        // Contar notificaciones de todos los usuarios de una empresa
        long total = notificacionRepository.countByEmpresa(idEmpresa);
        long totalHoy = notificacionRepository.countByEmpresaToday(idEmpresa);

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = notificacionRepository.getLast7DaysByEmpresa(idEmpresa);
        List<Object[]> datosHistoricos = notificacionRepository.getHistoric12MonthsByEmpresa(idEmpresa);

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
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

        // Contar postulaciones en proceso/pendiente del usuario (postulaciones.postulacion)
        long total = postulacionRepository.countByUsuarioAndEstado(idUsuario, "Pendiente");
        long totalHoy = 0; // No hay distinción de fecha de estado en postulaciones

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(new ArrayList<>());
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(new ArrayList<>());
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio((double) 0);
        return kpi;
    }

    private KpiItem crearKpiGuardadas(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar ofertas guardadas (favoritas)
        long total = ofertasFavoritasRepository.countByUsuario(idUsuario);
        long totalHoy = ofertasFavoritasRepository.countByUsuarioToday(idUsuario);

        // Obtener datos de últimos 7 días e históricos reales
        List<Object[]> datos7Dias = ofertasFavoritasRepository.getLast7Days(idUsuario);
        List<Object[]> datosHistoricos = ofertasFavoritasRepository.getHistoric12Months(idUsuario);

        kpi.setTotal((int) total);
        kpi.setTotalHoy((int) totalHoy);
        kpi.setDatosUltimos7Dias(procesarLast7Days(datos7Dias));
        kpi.setLabels7Dias(generarLabels7Dias());
        kpi.setDatosHistoricos(procesarHistoric12Months(datosHistoricos));
        kpi.setLabelsHistoricos(generarLabelsHistoricos());
        kpi.setPorcentajeCambio(calculaoPorcentaje((int) totalHoy, (int) (total - totalHoy)));
        return kpi;
    }

    private KpiItem crearKpiAlertas(Long idUsuario) {
        KpiItem kpi = new KpiItem();

        // Contar notificaciones no leídas (alertas) del usuario
        // "Alertas" se refiere a notificaciones no leídas (leida = false)
        long total = notificacionRepository.countUnreadByUsuario(idUsuario);
        long totalHoy = notificacionRepository.countUnreadByUsuarioToday(idUsuario);

        // Obtener datos de últimos 7 días e históricos reales para notificaciones no leídas
        List<Object[]> datos7Dias = notificacionRepository.getLast7DaysUnreadByUsuario(idUsuario);
        List<Object[]> datosHistoricos = notificacionRepository.getHistoric12MonthsUnreadByUsuario(idUsuario);

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
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.now();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            labels.add(currentDate.getMonth().toString().substring(0, 3) + " " + currentDate.getYear());
            currentDate = currentDate.plusMonths(1);
        }
        return labels;
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
     * Procesa datos históricos desde enero 2026 hasta hoy desde la BD y retorna una lista de counts
     * Rellena los meses faltantes con 0
     */
    private List<Integer> procesarHistoric12Months(List<Object[]> dbData) {
        List<Integer> result = new ArrayList<>();
        Map<String, Integer> dataMap = new HashMap<>();

        // Procesar datos de BD: Object[0] = yearMonth (ej: "2026-01"), Object[1] = count
        for (Object[] row : dbData) {
            String yearMonth = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            dataMap.put(yearMonth, count.intValue());
        }

        // Generar todos los meses desde enero 2026 hasta hoy y rellenar con 0 si no hay datos
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.now();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            String yearMonth = String.format("%d-%02d", currentDate.getYear(), currentDate.getMonthValue());
            result.add(dataMap.getOrDefault(yearMonth, 0));
            currentDate = currentDate.plusMonths(1);
        }

        return result;
    }

    /**
     * Procesa datos de auditorías por usuario desde enero 2026 hasta hoy
     * Retorna GraficoMultiDatasetDTO con un dataset por usuario
     * Rellena los meses faltantes con 0
     */
    private GraficoMultiDatasetDTO procesarAuditoriaTopUsuarios(List<Object[]> dbData) {
        GraficoMultiDatasetDTO grafico = new GraficoMultiDatasetDTO();

        // Colores para cada usuario (5 colores distinctos)
        String[] colors = {
            "rgb(59, 130, 246)",    // Azul
            "rgb(34, 197, 94)",     // Verde
            "rgb(239, 68, 68)",     // Rojo
            "rgb(168, 85, 247)",    // Púrpura
            "rgb(249, 115, 22)"     // Naranja
        };

        // Generar labels (meses desde enero 2026 hasta hoy)
        grafico.setLabels(generarLabelsHistoricos());

        // Agrupar datos por usuario
        Map<String, Map<String, Integer>> usuariosData = new TreeMap<>();
        for (Object[] row : dbData) {
            String usuario = row[0].toString();
            String mes = row[1].toString(); // Formato: YYYY-MM
            Long conteo = ((Number) row[2]).longValue();

            usuariosData.computeIfAbsent(usuario, k -> new HashMap<>())
                .put(mes, conteo.intValue());
        }

        // Crear dataset para cada usuario
        List<GraficoDataset> datasets = new ArrayList<>();
        int colorIndex = 0;

        for (String usuario : usuariosData.keySet()) {
            GraficoDataset dataset = new GraficoDataset();
            dataset.setLabel(usuario);
            dataset.setBorderColor(colors[colorIndex % colors.length]);
            dataset.setBackgroundColor(colors[colorIndex % colors.length].replace("rgb", "rgba").replace(")", ", 0.1)"));
            dataset.setFill(false);

            // Llenar datos para todos los meses (rellenar con 0 si no hay datos)
            List<Integer> datos = new ArrayList<>();
            LocalDate startDate = LocalDate.of(2026, 1, 1);
            LocalDate endDate = LocalDate.now();
            LocalDate currentDate = startDate;

            Map<String, Integer> userMonth = usuariosData.get(usuario);
            while (!currentDate.isAfter(endDate)) {
                String yearMonth = String.format("%d-%02d", currentDate.getYear(), currentDate.getMonthValue());
                datos.add(userMonth.getOrDefault(yearMonth, 0));
                currentDate = currentDate.plusMonths(1);
            }

            dataset.setData(datos);
            datasets.add(dataset);
            colorIndex++;
        }

        grafico.setDatasets(datasets);
        return grafico;
    }
}