package com.example.demo.service.Impl;

import com.example.demo.dto.AuditoriaDTO;
import com.example.demo.dto.ResumenAuditoriaDTO;
import com.example.demo.service.IAuditoriaService;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Table;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

import java.util.*;
import java.util.List;

// Importaciones para JSON (Jackson)
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// Importaciones iText 7
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements IAuditoriaService {
    private final JdbcTemplate jdbcTemplate;
    @PersistenceContext
    private EntityManager entityManager;

    // ==========================================
    // COLORES CORPORATIVOS
    // ==========================================
    private final DeviceRgb COLOR_PRIMARIO    = new DeviceRgb(37,  99,  235); // #2563EB Azul Royal
    private final DeviceRgb COLOR_FONDO_GRIS  = new DeviceRgb(245, 245, 247);
    private final DeviceRgb COLOR_TEXTO_GRIS  = new DeviceRgb(100, 100, 100);

    // Colores para el "Diff"
    private final DeviceRgb BG_ROJO   = new DeviceRgb(254, 226, 226);
    private final DeviceRgb TXT_ROJO  = new DeviceRgb(153,  27,  27);
    private final DeviceRgb BG_VERDE  = new DeviceRgb(220, 252, 231);
    private final DeviceRgb TXT_VERDE = new DeviceRgb( 22, 101,  52);

    // ==========================================
    // MÉTODOS DE NEGOCIO (Sin cambios)
    // ==========================================

    @Override
    public List<Map<String, Object>> obtenerTodosUsuarios() {
        List<Object[]> resultados = entityManager
                .createNativeQuery(
                        "SELECT id_usuario, nombre, apellido, correo, fecha_registro, " +
                                "estado_validacion, nombre_rol, ultimo_acceso, total_auditorias " +
                                "FROM seguridad.fn_obtener_todos_usuarios()"
                ).getResultList();

        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idUsuario",        row[0]);
            map.put("nombre",           row[1] != null ? row[1].toString() : "");
            map.put("apellido",         row[2] != null ? row[2].toString() : "");
            map.put("correo",           row[3] != null ? row[3].toString() : "");
            map.put("fechaRegistro",    row[4]);
            map.put("estadoValidacion", row[5] != null ? row[5].toString() : "PENDIENTE");

            Map<String, String> rolMap = new HashMap<>();
            rolMap.put("nombreRol", row[6] != null ? row[6].toString() : "SIN ROL");
            map.put("rol", rolMap);

            map.put("ultimoAcceso",    row[7]);
            map.put("totalAuditorias", row[8] != null ? ((Number) row[8]).longValue() : 0L);
            lista.add(map);
        }
        return lista;
    }

    @Override
    public Map<String, Object> getEstadisticasUsuarios() {
        Object[] row = (Object[]) entityManager
                .createNativeQuery(
                        "SELECT total_usuarios, usuarios_activos, administradores, " +
                                "empresas, usuarios_normales, registros_hoy " +
                                "FROM seguridad.fn_estadisticas_usuarios()"
                ).getSingleResult();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsuarios",    row[0] != null ? ((Number) row[0]).intValue() : 0);
        stats.put("usuariosActivos",  row[1] != null ? ((Number) row[1]).intValue() : 0);
        stats.put("administradores",  row[2] != null ? ((Number) row[2]).intValue() : 0);
        stats.put("empresas",         row[3] != null ? ((Number) row[3]).intValue() : 0);
        stats.put("usuariosNormales", row[4] != null ? ((Number) row[4]).intValue() : 0);
        stats.put("registrosHoy",     row[5] != null ? ((Number) row[5]).intValue() : 0);
        return stats;
    }

    @Override
    public List<AuditoriaDTO> getAuditoriasUsuario(Integer idUsuario) {
        List<Object[]> resultados = entityManager
                .createNativeQuery(
                        "SELECT id_auditoria, usuario_db::text, fecha_hora, " +
                                "accion::text, tabla_afectada::text, id_registro_afectado, " +
                                "datos_anteriores::text, datos_nuevos::text, campos_modificados::text " +
                                "FROM seguridad.fn_reporte_auditoria_usuario(:idUsuario)"
                ).setParameter("idUsuario", idUsuario).getResultList();

        return mapearResultadosAuditoria(resultados);
    }

    @Override
    public ResumenAuditoriaDTO getResumenAuditoria(Integer idUsuario) {
        Object[] res = (Object[]) entityManager
                .createNativeQuery("SELECT * FROM seguridad.fn_resumen_auditoria_usuario(:idUsuario)")
                .setParameter("idUsuario", idUsuario)
                .getSingleResult();

        ResumenAuditoriaDTO dto = new ResumenAuditoriaDTO();
        if (res != null) {
            dto.setTotalAcciones(res[0] != null ? ((Number) res[0]).intValue() : 0);
            if (res[1] != null) {
                if (res[1] instanceof java.time.LocalDateTime) {
                    dto.setUltimoAcceso((java.time.LocalDateTime) res[1]);
                } else {
                    dto.setUltimoAcceso(((java.sql.Timestamp) res[1]).toLocalDateTime());
                }
            }
            dto.setTotalInsert(res[2] != null ? ((Number) res[2]).intValue() : 0);
            dto.setTotalUpdate(res[3] != null ? ((Number) res[3]).intValue() : 0);
            dto.setTotalDelete(res[4] != null ? ((Number) res[4]).intValue() : 0);
        }
        return dto;
    }

    @Override
    public byte[] exportarUsuariosExcel(Map<String, Object> body) {
        List<Map<String, Object>> usuarios = obtenerTodosUsuarios();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Usuarios");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columnas = {"ID","Nombre","Apellido","Correo","Registro","Estado","Rol","Último Acceso","Auditorías"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIdx = 1;
            for (Map<String, Object> user : usuarios) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.get("idUsuario") != null ? user.get("idUsuario").toString() : "");
                row.createCell(1).setCellValue(Objects.toString(user.get("nombre"), ""));
                row.createCell(2).setCellValue(Objects.toString(user.get("apellido"), ""));
                row.createCell(3).setCellValue(Objects.toString(user.get("correo"), ""));
                row.createCell(4).setCellValue(Objects.toString(user.get("fechaRegistro"), ""));
                row.createCell(5).setCellValue(Objects.toString(user.get("estadoValidacion"), ""));
                Object rolObj = user.get("rol");
                String nombreRol = "Sin Rol";
                if (rolObj instanceof Map) { nombreRol = Objects.toString(((Map<?, ?>) rolObj).get("nombreRol"), "Sin Rol"); }
                row.createCell(6).setCellValue(nombreRol);
                row.createCell(7).setCellValue(Objects.toString(user.get("ultimoAcceso"), "N/A"));
                row.createCell(8).setCellValue(user.get("totalAuditorias") != null ? user.get("totalAuditorias").toString() : "0");
            }
            for (int i = 0; i < columnas.length; i++) { sheet.autoSizeColumn(i); }
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { System.err.println("Error generando Excel: " + e.getMessage()); return new byte[0]; }
    }

    @Override
    public byte[] exportarAuditoriasExcel(Integer idUsuario) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuario(idUsuario);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte_Auditoria");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle jsonStyle = workbook.createCellStyle();
            jsonStyle.setWrapText(true);
            jsonStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.TOP);

            String[] columnas = {"ID","Usuario DB","Fecha/Hora","Acción","Tabla","ID Registro","Datos Ant. / Cambios","Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIdx = 1;
            for (AuditoriaDTO aud : auditorias) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aud.getIdAuditoria() != null ? aud.getIdAuditoria() : 0);
                row.createCell(1).setCellValue(Objects.toString(aud.getUsuarioDb(), "N/A"));
                row.createCell(2).setCellValue(Objects.toString(aud.getFechaHora(), ""));
                row.createCell(3).setCellValue(Objects.toString(aud.getAccion(), ""));
                row.createCell(4).setCellValue(Objects.toString(aud.getTablaAfectada(), ""));
                row.createCell(5).setCellValue(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : 0);
                org.apache.poi.ss.usermodel.Cell cellAnt = row.createCell(6);
                org.apache.poi.ss.usermodel.Cell cellNue = row.createCell(7);
                cellAnt.setCellStyle(jsonStyle); cellNue.setCellStyle(jsonStyle);
                if ("UPDATE".equalsIgnoreCase(aud.getAccion())) {
                    cellAnt.setCellValue(formatearJsonParaExcel(aud.getCamposModificados()));
                    cellNue.setCellValue("N/A");
                } else {
                    cellAnt.setCellValue(formatearJsonParaExcel(aud.getDatosAnteriores()));
                    cellNue.setCellValue(formatearJsonParaExcel(aud.getDatosNuevos()));
                }
            }
            for (int i = 0; i <= 5; i++) sheet.autoSizeColumn(i);
            sheet.setColumnWidth(6, 12000); sheet.setColumnWidth(7, 12000);
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { System.err.println("Error generando Excel de Auditoría: " + e.getMessage()); return new byte[0]; }
    }

    @Override
    public List<AuditoriaDTO> getAuditoriasUsuarioPorTipo(Integer idUsuario, String tipo) {
        return getAuditoriasUsuario(idUsuario).stream()
                .filter(a -> a.getAccion() != null && a.getAccion().equalsIgnoreCase(tipo))
                .toList();
    }

    @Override
    public byte[] exportarAuditoriasExcelPorTipo(Integer idUsuario, String tipo) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuarioPorTipo(idUsuario, tipo);
        boolean esUpdate = "UPDATE".equalsIgnoreCase(tipo);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Auditoria_" + tipo.toUpperCase());
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            switch (tipo.toUpperCase()) {
                case "INSERT" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
                case "DELETE" -> headerStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
                case "UPDATE" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                default       -> headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            }
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle jsonStyle = workbook.createCellStyle();
            jsonStyle.setWrapText(true);
            jsonStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.TOP);

            String[] columnas = esUpdate
                    ? new String[]{"ID","Usuario DB","Fecha/Hora","Acción","Tabla","ID Reg.","Campos Modificados"}
                    : new String[]{"ID","Usuario DB","Fecha/Hora","Acción","Tabla","ID Reg.","Datos Ant.","Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIdx = 1;
            for (AuditoriaDTO aud : auditorias) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aud.getIdAuditoria() != null ? aud.getIdAuditoria() : 0);
                row.createCell(1).setCellValue(Objects.toString(aud.getUsuarioDb(), "N/A"));
                row.createCell(2).setCellValue(Objects.toString(aud.getFechaHora(), ""));
                row.createCell(3).setCellValue(Objects.toString(aud.getAccion(), ""));
                row.createCell(4).setCellValue(Objects.toString(aud.getTablaAfectada(), ""));
                row.createCell(5).setCellValue(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : 0);
                org.apache.poi.ss.usermodel.Cell cellData1 = row.createCell(6);
                cellData1.setCellStyle(jsonStyle);
                if (esUpdate) {
                    cellData1.setCellValue(formatearJsonParaExcel(aud.getCamposModificados()));
                } else {
                    cellData1.setCellValue(formatearJsonParaExcel(aud.getDatosAnteriores()));
                    org.apache.poi.ss.usermodel.Cell cellData2 = row.createCell(7);
                    cellData2.setCellStyle(jsonStyle);
                    cellData2.setCellValue(formatearJsonParaExcel(aud.getDatosNuevos()));
                }
            }
            for (int i = 0; i <= 5; i++) sheet.autoSizeColumn(i);
            sheet.setColumnWidth(6, 12000);
            if (!esUpdate) sheet.setColumnWidth(7, 12000);
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { System.err.println("Error generando Excel filtrado: " + e.getMessage()); return new byte[0]; }
    }

    // ==========================================
    // PDF CORPORATIVO — VERSIÓN FINAL CON TRAZABILIDAD
    // ==========================================

    @Override
    public byte[] exportarAuditoriasPdfPorTipo(Integer idParametro, String tipo) {

        // 🔥 MAGIA: Identificamos si es un reporte genérico o la trazabilidad de una sola oferta
        boolean esTrazabilidad = "TRAZABILIDAD_OFERTA".equalsIgnoreCase(tipo);
        boolean esUpdate = "UPDATE".equalsIgnoreCase(tipo);

        List<AuditoriaDTO> auditorias;
        String tituloPrincipal;
        String subtituloReporte;

        if (esTrazabilidad) {
            // Si es trazabilidad, el idParametro que llega es el ID de la Oferta
            auditorias = obtenerHistorialPorOferta(idParametro);
            tituloPrincipal = "EXPEDIENTE DE TRAZABILIDAD";
            subtituloReporte = "Historial cronológico de la Oferta Laboral #" + idParametro;
        } else {
            // Si es normal, el idParametro es el ID del Usuario
            auditorias = getAuditoriasUsuarioPorTipo(idParametro, tipo);
            tituloPrincipal = "REPORTE DE AUDITORÍAS";
            subtituloReporte = "Detalle de actualizaciones (" + tipo.toUpperCase() + ")";
        }

        // Obtener Config de Empresa
        String nombreApp = "Bolsa de Empleos UTEQ";
        String logoUrl = "";
        try {
            Map<String, Object> configEmpresa = jdbcTemplate.queryForMap("SELECT nombre_aplicativo, logo_url FROM seguridad.sistema_empresa LIMIT 1");
            if (configEmpresa.get("nombre_aplicativo") != null) nombreApp = configEmpresa.get("nombre_aplicativo").toString();
            if (configEmpresa.get("logo_url") != null) logoUrl = configEmpresa.get("logo_url").toString();
        } catch (Exception ignored) {}

        // Generación del PDF
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(30, 30, 40, 30);

            // --- HEADER MODERNO ---
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{15, 50, 35}))
                    .useAllAvailableWidth().setMarginBottom(20);

            Cell logoCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE);
            if (!logoUrl.isEmpty()) {
                try {
                    Image img = new Image(ImageDataFactory.create(logoUrl)).setMaxWidth(80);
                    logoCell.add(img);
                } catch (Exception ignored) {}
            }
            headerTable.addCell(logoCell);

            Cell titleCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE);
            titleCell.add(new Paragraph(nombreApp.toUpperCase())
                    .setFontSize(22).setBold().setFontColor(COLOR_PRIMARIO).setMarginBottom(-5));
            titleCell.add(new Paragraph(tituloPrincipal + " - " + subtituloReporte)
                    .setFontSize(12).setFontColor(ColorConstants.GRAY).setItalic());
            headerTable.addCell(titleCell);

            Cell infoCell = new Cell().setBorder(Border.NO_BORDER).setPadding(10)
                    .setBackgroundColor(new DeviceRgb(245, 247, 250))
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);

            String fechaGen = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            infoCell.add(new Paragraph("Generado: " + fechaGen).setFontSize(8));
            infoCell.add(new Paragraph("Referencia ID: " + idParametro).setFontSize(8).setBold());
            infoCell.add(new Paragraph("Total Movimientos: " + auditorias.size()).setFontSize(8).setFontColor(COLOR_PRIMARIO));
            headerTable.addCell(infoCell);
            document.add(headerTable);

            // --- COLUMNAS DINÁMICAS ---
            float[] anchos;
            String[] headersCols;

            if (esTrazabilidad) {
                // En trazabilidad no ocupamos ver la tabla ni ID, porque todo es sobre la misma oferta
                anchos = new float[]{1.2f, 3.5f, 3.5f, 2.5f, 6.5f};
                headersCols = new String[]{"ID", "EJECUTOR", "FECHA/HORA", "ACCIÓN", "DETALLE DE LOS DATOS"};
            } else if (esUpdate) {
                anchos = new float[]{1.2f, 3.5f, 3.5f, 1.5f, 3f, 1.2f, 7f};
                headersCols = new String[]{"ID", "USUARIO DB", "FECHA/HORA", "ACCIÓN", "TABLA", "ID REG.", "DETALLE DE CAMBIOS"};
            } else {
                anchos = new float[]{1f, 3f, 3.5f, 1.5f, 3f, 1.2f, 4f, 4f};
                headersCols = new String[]{"ID", "USUARIO DB", "FECHA/HORA", "ACCIÓN", "TABLA", "ID REG.", "DATOS ANTERIORES", "DATOS NUEVOS"};
            }

            Table tabla = new Table(UnitValue.createPercentArray(anchos)).useAllAvailableWidth();

            for (String h : headersCols) {
                tabla.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontSize(8).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(COLOR_PRIMARIO).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER).setPadding(6));
            }

            // --- PINTADO DE FILAS DINÁMICO ---
            for (AuditoriaDTO aud : auditorias) {
                tabla.addCell(celdaModerna(String.valueOf(aud.getIdAuditoria()), TextAlignment.CENTER));
                tabla.addCell(celdaModerna(Objects.toString(aud.getUsuarioDb(), "N/A"), TextAlignment.LEFT));
                tabla.addCell(celdaModerna(Objects.toString(aud.getFechaHora(), ""), TextAlignment.CENTER));

                String accionAud = Objects.toString(aud.getAccion(), "").toUpperCase();
                tabla.addCell(celdaEtiquetaAccion(accionAud));

                if (esTrazabilidad) {
                    // Lógica visual específica para el Historial de la Oferta
                    if (accionAud.contains("UPDATE") || accionAud.contains("ACTUALIZADA") || accionAud.contains("MODIFICADA")) {
                        tabla.addCell(celdaPdfUpdateDiff(aud.getCamposModificados(), ColorConstants.WHITE));
                    } else if (accionAud.contains("DELETE") || accionAud.contains("ELIMINADA") || accionAud.contains("RECHAZADA")) {
                        tabla.addCell(celdaModerna("DATOS RETIRADOS:\n" + formatearJsonParaExcel(aud.getDatosAnteriores()), TextAlignment.LEFT));
                    } else {
                        tabla.addCell(celdaModerna("DATOS REGISTRADOS:\n" + formatearJsonParaExcel(aud.getDatosNuevos()), TextAlignment.LEFT));
                    }
                } else {
                    // Lógica para Reportes Generales (Tu código original)
                    tabla.addCell(celdaModerna(Objects.toString(aud.getTablaAfectada(), ""), TextAlignment.LEFT));
                    tabla.addCell(celdaModerna(aud.getIdRegistroAfectado() != null ? String.valueOf(aud.getIdRegistroAfectado()) : "", TextAlignment.CENTER));

                    if (esUpdate) {
                        tabla.addCell(celdaPdfUpdateDiff(aud.getCamposModificados(), ColorConstants.WHITE));
                    } else {
                        tabla.addCell(celdaModerna(formatearJsonParaExcel(aud.getDatosAnteriores()), TextAlignment.LEFT));
                        tabla.addCell(celdaModerna(formatearJsonParaExcel(aud.getDatosNuevos()), TextAlignment.LEFT));
                    }
                }
            }

            document.add(tabla);

            // --- FOOTER LIMPIO ---
            Paragraph footerText = new Paragraph("Este documento es confidencial y para uso exclusivo. Generado automáticamente por el Módulo de Seguridad.")
                    .setFontSize(7).setFontColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER).setMarginTop(20);

            document.add(footerText);
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generando PDF: " + e.getMessage());
            e.printStackTrace();
            return new byte[0];
        }
    }

    // ==========================================
    // UTILERÍAS PRIVADAS PARA EL DISEÑO Y QUERIES
    // ==========================================

    /**
     * 🔥 CONSULTA CORREGIDA: Extrae la trazabilidad exacta usando la misma función del frontend.
     */
    private List<AuditoriaDTO> obtenerHistorialPorOferta(Integer idOferta) {
        // Armamos el JSON exactamente como lo hace HistorialOfertaServiceImpl
        String jsonParam = "{\"id_oferta\": " + idOferta + "}";

        // Llamamos a la función de base de datos
        String sql = "SELECT * FROM ofertas.fn_obtener_trazabilidad_oferta(CAST(:json AS json))";

        List<Object[]> resultados = entityManager.createNativeQuery(sql)
                .setParameter("json", jsonParam)
                .getResultList();

        // Mapeamos manualmente a AuditoriaDTO para que el PDF lo pueda leer
        List<AuditoriaDTO> historialMapeado = new ArrayList<>();

        for (Object[] obj : resultados) {
            AuditoriaDTO dto = new AuditoriaDTO();

            // obj[0] -> id_historial
            dto.setIdAuditoria(obj[0] != null ? ((Number) obj[0]).intValue() : null);

            // obj[1] -> accion
            dto.setAccion(obj[1] != null ? obj[1].toString() : "");

            // obj[2] -> fecha_hora
            if (obj[2] != null) {
                if (obj[2] instanceof java.sql.Timestamp) {
                    dto.setFechaHora(((java.sql.Timestamp) obj[2]).toLocalDateTime());
                } else if (obj[2] instanceof java.time.LocalDateTime) {
                    dto.setFechaHora((java.time.LocalDateTime) obj[2]);
                }
            }

            // obj[3] -> ejecutor
            dto.setUsuarioDb(obj[3] != null ? obj[3].toString() : "Sistema");

            // obj[4] -> campo_modificado (Si necesitas mostrarlo, puedes meterlo en un campo del DTO)

            // obj[5] -> valores_anteriores (JSON)
            dto.setDatosAnteriores(obj[5] != null ? obj[5].toString() : null);

            // obj[6] -> valores_nuevos (JSON)
            dto.setDatosNuevos(obj[6] != null ? obj[6].toString() : null);

            // Para que el método de diseño UPDATE funcione, pasamos el campo "campos_modificados"
            // usando los mismos JSONs para que los compare.
            if (dto.getAccion().toUpperCase().contains("UPDATE") || dto.getAccion().toUpperCase().contains("ACTUALIZADA")) {
                dto.setCamposModificados(generarJsonDiffSimulado(dto.getDatosAnteriores(), dto.getDatosNuevos()));
            }

            historialMapeado.add(dto);
        }

        return historialMapeado;
    }

    /**
     * Utilidad para crear un JSON compatible con tu método celdaPdfUpdateDiff,
     * simulando el formato {"campo": {"anterior": "A", "nuevo": "B"}}
     */
    private String generarJsonDiffSimulado(String jsonAnterior, String jsonNuevo) {
        if (jsonAnterior == null && jsonNuevo == null) return "{}";
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode oldNode = jsonAnterior != null ? mapper.readTree(jsonAnterior) : mapper.createObjectNode();
            JsonNode newNode = jsonNuevo != null ? mapper.readTree(jsonNuevo) : mapper.createObjectNode();

            com.fasterxml.jackson.databind.node.ObjectNode diffNode = mapper.createObjectNode();

            // Juntamos todas las claves de ambos JSONs
            Set<String> allKeys = new HashSet<>();
            oldNode.fieldNames().forEachRemaining(allKeys::add);
            newNode.fieldNames().forEachRemaining(allKeys::add);

            for (String key : allKeys) {
                com.fasterxml.jackson.databind.node.ObjectNode valNode = mapper.createObjectNode();
                valNode.put("anterior", oldNode.has(key) && !oldNode.get(key).isNull() ? oldNode.get(key).asText() : "N/A");
                valNode.put("nuevo", newNode.has(key) && !newNode.get(key).isNull() ? newNode.get(key).asText() : "N/A");
                diffNode.set(key, valNode);
            }
            return diffNode.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     * Helper para mapear objetos de BD a DTO.
     */
    private List<AuditoriaDTO> mapearResultadosAuditoria(List<Object[]> resultados) {
        return resultados.stream().map(row -> new AuditoriaDTO(
                row[0] != null ? ((Number) row[0]).intValue() : null,
                row[1] != null ? row[1].toString() : null,
                null,
                row[2] != null ? (row[2] instanceof java.sql.Timestamp ? ((java.sql.Timestamp) row[2]).toLocalDateTime() : (java.time.LocalDateTime) row[2]) : null,
                row[3] != null ? row[3].toString() : null,
                row[4] != null ? row[4].toString() : null,
                row[5] != null ? ((Number) row[5]).intValue() : null,
                row[6] != null ? row[6].toString() : null,
                row[7] != null ? row[7].toString() : null,
                row[8] != null ? row[8].toString() : null
        )).toList();
    }

    private Cell celdaModerna(String texto, TextAlignment alineacion) {
        return new Cell().add(new Paragraph(texto != null ? texto : "").setFontSize(8))
                .setBorder(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f))
                .setPadding(5).setTextAlignment(alineacion).setVerticalAlignment(VerticalAlignment.MIDDLE);
    }

    private Cell celdaEtiquetaAccion(String accion) {
        com.itextpdf.kernel.colors.Color colorEtiqueta;
        String acc = accion.toUpperCase();

        if (acc.contains("INSERT") || acc.contains("CREADA") || acc.contains("NUEVA") || acc.contains("APROBADA")) {
            colorEtiqueta = new DeviceRgb(40, 167, 69); // Verde
        } else if (acc.contains("UPDATE") || acc.contains("ACTUALIZADA") || acc.contains("MODIFICADA")) {
            colorEtiqueta = new DeviceRgb(253, 126, 20); // Naranja
        } else if (acc.contains("DELETE") || acc.contains("ELIMINADA") || acc.contains("RECHAZADA") || acc.contains("RETIRADA")) {
            colorEtiqueta = new DeviceRgb(220, 53, 69); // Rojo
        } else {
            colorEtiqueta = ColorConstants.GRAY;
        }

        return new Cell().add(new Paragraph(accion).setBold().setFontSize(7).setFontColor(colorEtiqueta))
                .setBorder(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f))
                .setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE);
    }

    private Cell celdaPdfUpdateDiff(String jsonStr, com.itextpdf.kernel.colors.Color bg) {
        Cell celda = new Cell().setBackgroundColor(bg).setBorder(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f)).setPadding(5);
        if (jsonStr == null || jsonStr.trim().isEmpty() || "{}".equals(jsonStr)) {
            return celda.add(new Paragraph("Sin cambios detectados").setFontSize(8).setFontColor(COLOR_TEXTO_GRIS));
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonStr);
            Iterator<Map.Entry<String, JsonNode>> fields = rootNode.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String nombreCampo = field.getKey().replace("_", " ").toUpperCase();
                JsonNode valores = field.getValue();

                String anterior = valores.has("anterior") && !valores.get("anterior").isNull() ? valores.get("anterior").asText() : "N/A";
                String nuevo = valores.has("nuevo") && !valores.get("nuevo").isNull() ? valores.get("nuevo").asText() : "N/A";

                celda.add(new Paragraph(nombreCampo + ":").setFontSize(8).setBold().setMarginBottom(1));
                Paragraph badges = new Paragraph().setMarginBottom(4);
                badges.add(new Text(" Anterior: " + anterior + " ").setFontSize(8).setFontColor(TXT_ROJO).setBackgroundColor(BG_ROJO));
                badges.add(new Text("    "));
                badges.add(new Text(" Nuevo: " + nuevo + " ").setFontSize(8).setFontColor(TXT_VERDE).setBackgroundColor(BG_VERDE));
                celda.add(badges);
            }
        } catch (Exception e) {
            celda.add(new Paragraph(formatearJsonParaExcel(jsonStr)).setFontSize(8));
        }
        return celda;
    }

    private String formatearJsonParaExcel(String json) {
        if (json == null || json.trim().isEmpty() || json.equals("{}")) { return ""; }
        return json.replace("{", "").replace("}", "").replace("\"", "").replace(",", "\n").replace(":", ": ");
    }

    @Override
    public List<Map<String, Object>> getSesiones() {
        List<Object[]> rows = entityManager.createNativeQuery("SELECT * FROM seguridad.fn_obtener_sesiones()").getResultList();
        return rows.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idSesion",    row[0]);
            map.put("loginName",   row[1]);
            map.put("fechaInicio", row[2]);
            map.put("fechaCierre", row[3]);
            map.put("ipAddress",   row[4]);
            map.put("navegador",   row[5]);
            map.put("accion",      row[6]);
            map.put("estadoValidacion", row[7]);
            return map;
        }).toList();
    }
}