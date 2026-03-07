package com.example.demo.service.Impl;

import com.example.demo.dto.AuditoriaDTO;
import com.example.demo.dto.ResumenAuditoriaDTO;
import com.example.demo.service.IAuditoriaService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

import java.util.*;

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
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;

@Service
public class AuditoriaServiceImpl implements IAuditoriaService {

    @PersistenceContext
    private EntityManager entityManager;

    // Colores Corporativos para el PDF
    private final DeviceRgb COLOR_PRIMARIO = new DeviceRgb(37, 99, 235); // #2563EB (Azul Royal)
    private final DeviceRgb COLOR_FONDO_GRIS = new DeviceRgb(245, 245, 247);
    private final DeviceRgb COLOR_TEXTO_GRIS = new DeviceRgb(100, 100, 100);

    // Colores para el "Diff" (Rojo y Verde)
    private final DeviceRgb BG_ROJO = new DeviceRgb(254, 226, 226);
    private final DeviceRgb TXT_ROJO = new DeviceRgb(153, 27, 27);
    private final DeviceRgb BG_VERDE = new DeviceRgb(220, 252, 231);
    private final DeviceRgb TXT_VERDE = new DeviceRgb(22, 101, 52);

    // ==========================================
    // MÉTODOS EXISTENTES (SIN MODIFICAR LÓGICA)
    // ==========================================

    @Override
    public List<Map<String, Object>> obtenerTodosUsuarios() {
        List<Object[]> resultados = entityManager
                .createNativeQuery(
                        "SELECT id_usuario, nombre, apellido, correo, fecha_registro, " +
                                "estado_validacion, nombre_rol, ultimo_acceso, total_auditorias " +
                                "FROM seguridad.fn_obtener_todos_usuarios()"
                )
                .getResultList();

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
            rolMap.put("nombreRol",     row[6] != null ? row[6].toString() : "SIN ROL");
            map.put("rol",              rolMap);

            map.put("ultimoAcceso",     row[7]);
            map.put("totalAuditorias",  row[8] != null ? ((Number) row[8]).longValue() : 0L);

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
                )
                .getSingleResult();

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
                )
                .setParameter("idUsuario", idUsuario)
                .getResultList();

        return resultados.stream().map(row -> new AuditoriaDTO(
                row[0] != null ? ((Number) row[0]).intValue() : null,
                row[1] != null ? row[1].toString() : null,
                null,
                row[2] != null ? (row[2] instanceof java.sql.Timestamp ?
                        ((java.sql.Timestamp) row[2]).toLocalDateTime() :
                        (java.time.LocalDateTime) row[2]) : null,
                row[3] != null ? row[3].toString() : null,
                row[4] != null ? row[4].toString() : null,
                row[5] != null ? ((Number) row[5]).intValue() : null,
                row[6] != null ? row[6].toString() : null,
                row[7] != null ? row[7].toString() : null,
                row[8] != null ? row[8].toString() : null
        )).toList();
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
        // (El código de exportar usuarios Excel se mantiene igual)
        List<Map<String, Object>> usuarios = obtenerTodosUsuarios();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Usuarios");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columnas = {"ID", "Nombre", "Apellido", "Correo", "Registro", "Estado", "Rol", "Último Acceso", "Auditorías"};
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
        // (Se mantiene igual que la versión anterior inteligente)
        List<AuditoriaDTO> auditorias = getAuditoriasUsuario(idUsuario);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte_Auditoria");
            CellStyle headerStyle = workbook.createCellStyle(); Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex()); headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle jsonStyle = workbook.createCellStyle(); jsonStyle.setWrapText(true); jsonStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.TOP);

            String[] columnas = {"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Registro", "Datos Ant. / Cambios", "Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) { org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i); cell.setCellValue(columnas[i]); cell.setCellStyle(headerStyle); }

            int rowIdx = 1;
            for (AuditoriaDTO aud : auditorias) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aud.getIdAuditoria() != null ? aud.getIdAuditoria() : 0);
                row.createCell(1).setCellValue(Objects.toString(aud.getUsuarioDb(), "N/A"));
                row.createCell(2).setCellValue(Objects.toString(aud.getFechaHora(), ""));
                row.createCell(3).setCellValue(Objects.toString(aud.getAccion(), ""));
                row.createCell(4).setCellValue(Objects.toString(aud.getTablaAfectada(), ""));
                row.createCell(5).setCellValue(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : 0);
                org.apache.poi.ss.usermodel.Cell cellAnt = row.createCell(6); org.apache.poi.ss.usermodel.Cell cellNue = row.createCell(7);
                cellAnt.setCellStyle(jsonStyle); cellNue.setCellStyle(jsonStyle);

                if ("UPDATE".equalsIgnoreCase(aud.getAccion())) {
                    cellAnt.setCellValue(formatearJsonParaExcel(aud.getCamposModificados())); cellNue.setCellValue("N/A");
                } else {
                    cellAnt.setCellValue(formatearJsonParaExcel(aud.getDatosAnteriores())); cellNue.setCellValue(formatearJsonParaExcel(aud.getDatosNuevos()));
                }
            }
            for (int i = 0; i <= 5; i++) sheet.autoSizeColumn(i);
            sheet.setColumnWidth(6, 12000); sheet.setColumnWidth(7, 12000);
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { System.err.println("Error generando Excel de Auditoría: " + e.getMessage()); return new byte[0]; }
    }

    @Override
    public List<AuditoriaDTO> getAuditoriasUsuarioPorTipo(Integer idUsuario, String tipo) {
        return getAuditoriasUsuario(idUsuario).stream().filter(a -> a.getAccion() != null && a.getAccion().equalsIgnoreCase(tipo)).toList();
    }

    @Override
    public byte[] exportarAuditoriasExcelPorTipo(Integer idUsuario, String tipo) {
        // (Se mantiene igual, funcional y dinámico)
        List<AuditoriaDTO> auditorias = getAuditoriasUsuarioPorTipo(idUsuario, tipo);
        boolean esUpdate = "UPDATE".equalsIgnoreCase(tipo);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Auditoria_" + tipo.toUpperCase());
            CellStyle headerStyle = workbook.createCellStyle(); Font font = workbook.createFont(); font.setBold(true); headerStyle.setFont(font);
            switch (tipo.toUpperCase()) {
                case "INSERT" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
                case "DELETE" -> headerStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
                case "UPDATE" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                default       -> headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            }
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle jsonStyle = workbook.createCellStyle(); jsonStyle.setWrapText(true); jsonStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.TOP);

            String[] columnas = esUpdate ? new String[]{"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Reg.", "Campos Modificados"} : new String[]{"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Reg.", "Datos Ant.", "Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) { org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i); cell.setCellValue(columnas[i]); cell.setCellStyle(headerStyle); }

            int rowIdx = 1;
            for (AuditoriaDTO aud : auditorias) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aud.getIdAuditoria() != null ? aud.getIdAuditoria() : 0);
                row.createCell(1).setCellValue(Objects.toString(aud.getUsuarioDb(), "N/A"));
                row.createCell(2).setCellValue(Objects.toString(aud.getFechaHora(), ""));
                row.createCell(3).setCellValue(Objects.toString(aud.getAccion(), ""));
                row.createCell(4).setCellValue(Objects.toString(aud.getTablaAfectada(), ""));
                row.createCell(5).setCellValue(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : 0);
                org.apache.poi.ss.usermodel.Cell cellData1 = row.createCell(6); cellData1.setCellStyle(jsonStyle);

                if (esUpdate) { cellData1.setCellValue(formatearJsonParaExcel(aud.getCamposModificados())); }
                else { cellData1.setCellValue(formatearJsonParaExcel(aud.getDatosAnteriores())); org.apache.poi.ss.usermodel.Cell cellData2 = row.createCell(7); cellData2.setCellStyle(jsonStyle); cellData2.setCellValue(formatearJsonParaExcel(aud.getDatosNuevos())); }
            }
            for (int i = 0; i <= 5; i++) sheet.autoSizeColumn(i);
            sheet.setColumnWidth(6, 12000); if (!esUpdate) sheet.setColumnWidth(7, 12000);
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { System.err.println("Error generando Excel filtrado: " + e.getMessage()); return new byte[0]; }
    }


    // ==========================================
    // 🔥 NUEVO PDF CORPORATIVO MODO DIOS 🔥
    // ==========================================

    @Override
    public byte[] exportarAuditoriasPdfPorTipo(Integer idUsuario, String tipo) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuarioPorTipo(idUsuario, tipo);
        boolean esUpdate = "UPDATE".equalsIgnoreCase(tipo);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate()); // Horizontal
            document.setMargins(20, 20, 40, 20); // Márgenes

            // 1. HEADER CORPORATIVO (AZUL Y GRIS)
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
            headerTable.setMarginBottom(15);

            // Celda Izquierda (Azul)
            Cell headerLeft = new Cell().setBackgroundColor(COLOR_PRIMARIO).setPadding(15).setBorder(Border.NO_BORDER);
            headerLeft.add(new Paragraph("UTEQ").setFontSize(28).setBold().setFontColor(ColorConstants.WHITE).setMargin(0));
            headerLeft.add(new Paragraph("REPORTE DE AUDITORÍAS").setFontSize(14).setBold().setFontColor(ColorConstants.WHITE).setMarginTop(5).setMarginBottom(0));
            headerLeft.add(new Paragraph("DETALLE DE ACTUALIZACIONES (" + tipo.toUpperCase() + ")").setFontSize(10).setFontColor(ColorConstants.WHITE).setMargin(0));
            headerTable.addCell(headerLeft);

            // Celda Derecha (Gris Claro)
            Cell headerRight = new Cell().setBackgroundColor(COLOR_FONDO_GRIS).setPadding(15).setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);
            headerRight.add(new Paragraph("Generado: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFontSize(10).setFontColor(COLOR_TEXTO_GRIS).setMargin(0));
            headerRight.add(new Paragraph("ID Usuario Filtrado: " + (idUsuario != null ? idUsuario : "Todos"))
                    .setFontSize(10).setFontColor(COLOR_TEXTO_GRIS).setMarginTop(4).setMarginBottom(0));
            headerRight.add(new Paragraph("Total Registros: " + auditorias.size())
                    .setFontSize(10).setFontColor(COLOR_TEXTO_GRIS).setMarginTop(4).setMarginBottom(0));
            headerTable.addCell(headerRight);

            document.add(headerTable);

            // 2. TABLA DE DATOS
            float[] anchos = esUpdate
                    ? new float[]{1f, 3f, 2.5f, 2.5f, 1.5f, 5.5f} // 6 columnas para UPDATE
                    : new float[]{1f, 2.5f, 2.5f, 2f, 1.5f, 3.5f, 3.5f}; // 7 col para INSERT/DELETE (Sin columna "Accion" porque ya es obvia por el reporte)

            Table tabla = new Table(UnitValue.createPercentArray(anchos)).useAllAvailableWidth();

            String[] headers = esUpdate
                    ? new String[]{"ID", "USUARIO DB", "FECHA/HORA", "TABLA", "ID REG.", "DETALLE DE CAMBIOS"}
                    : new String[]{"ID", "USUARIO DB", "FECHA/HORA", "TABLA", "ID REG.", "DATOS ANTERIORES", "DATOS NUEVOS"};

            // Pintar Cabeceras
            for (String h : headers) {
                tabla.addHeaderCell(
                        new Cell().add(new Paragraph(h).setBold().setFontSize(9).setFontColor(ColorConstants.WHITE))
                                .setBackgroundColor(COLOR_PRIMARIO)
                                .setBorder(new SolidBorder(ColorConstants.WHITE, 1))
                                .setTextAlignment(TextAlignment.CENTER)
                                .setPadding(6)
                );
            }

            // Filas Alternas
            boolean par = false;
            for (AuditoriaDTO aud : auditorias) {
                com.itextpdf.kernel.colors.Color bg = par ? COLOR_FONDO_GRIS : ColorConstants.WHITE;

                tabla.addCell(celdaPdfBasica(String.valueOf(aud.getIdAuditoria()), bg, TextAlignment.CENTER));
                tabla.addCell(celdaPdfBasica(Objects.toString(aud.getUsuarioDb(), "N/A"), bg, TextAlignment.LEFT));
                tabla.addCell(celdaPdfBasica(Objects.toString(aud.getFechaHora(), ""), bg, TextAlignment.CENTER));
                tabla.addCell(celdaPdfBasica(Objects.toString(aud.getTablaAfectada(), ""), bg, TextAlignment.LEFT));
                tabla.addCell(celdaPdfBasica(String.valueOf(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : ""), bg, TextAlignment.CENTER));

                if (esUpdate) {
                    // 🔥 LA MAGIA DEL DIFF EN PDF
                    tabla.addCell(celdaPdfUpdateDiff(aud.getCamposModificados(), bg));
                } else {
                    tabla.addCell(celdaPdfBasica(formatearJsonParaExcel(aud.getDatosAnteriores()), bg, TextAlignment.LEFT));
                    tabla.addCell(celdaPdfBasica(formatearJsonParaExcel(aud.getDatosNuevos()), bg, TextAlignment.LEFT));
                }
                par = !par;
            }

            document.add(tabla);

            // 3. PIE DE PÁGINA SIMPLE
            Table footer = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            footer.setMarginTop(20);
            footer.addCell(new Cell().add(new Paragraph("Bolsa de Empleo UTEQ — Módulo de Seguridad").setFontSize(8).setFontColor(COLOR_TEXTO_GRIS))
                    .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.LEFT));
            footer.addCell(new Cell().add(new Paragraph("Confidencial — Para uso interno solamente").setFontSize(8).setFontColor(COLOR_TEXTO_GRIS))
                    .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generando PDF: " + e.getMessage());
            e.printStackTrace();
            return new byte[0];
        }
    }

    // ==========================================
    // UTILERÍAS PARA EL PDF
    // ==========================================

    private Cell celdaPdfBasica(String valor, com.itextpdf.kernel.colors.Color bg, TextAlignment alineacion) {
        return new Cell()
                .add(new Paragraph(valor != null ? valor : "").setFontSize(8))
                .setBackgroundColor(bg)
                .setTextAlignment(alineacion)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                // ✨ ESTA ES LA LÍNEA CORREGIDA
                .setBorder(new SolidBorder(new DeviceRgb(220, 220, 220), 1))
                .setPadding(6);
    }

    // 2do Método Auxiliar arreglado
    private Cell celdaPdfUpdateDiff(String jsonStr, com.itextpdf.kernel.colors.Color bg) {
        // ✨ ESTA ES LA LÍNEA CORREGIDA
        Cell celda = new Cell().setBackgroundColor(bg)
                .setBorder(new SolidBorder(new DeviceRgb(220, 220, 220), 1))
                .setPadding(6);

        if (jsonStr == null || jsonStr.trim().isEmpty() || "{}".equals(jsonStr)) {
            return celda.add(new Paragraph("Sin cambios detectados").setFontSize(8).setFontColor(COLOR_TEXTO_GRIS));
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonStr);
            Iterator<Map.Entry<String, JsonNode>> fields = rootNode.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String nombreCampo = field.getKey().replace("_", " "); // "estado_validacion" -> "estado validacion"
                JsonNode valores = field.getValue();

                String anterior = valores.has("anterior") && !valores.get("anterior").isNull() ? valores.get("anterior").asText() : "N/A";
                String nuevo = valores.has("nuevo") && !valores.get("nuevo").isNull() ? valores.get("nuevo").asText() : "N/A";

                // 1. Nombre del campo en Negrita
                celda.add(new Paragraph(nombreCampo + ":").setFontSize(8).setBold().setMarginBottom(2));

                // 2. Bloque visual (Badges de colores)
                Paragraph badges = new Paragraph().setMarginBottom(6);

                // Badge Anterior (Rojo)
                Text txtAnt = new Text(" Anterior: " + anterior + " ")
                        .setFontSize(8)
                        .setFontColor(TXT_ROJO)
                        .setBackgroundColor(BG_ROJO);

                // Espacio
                Text espacio = new Text("   ");

                // Badge Nuevo (Verde)
                Text txtNue = new Text(" Nuevo: " + nuevo + " ")
                        .setFontSize(8)
                        .setFontColor(TXT_VERDE)
                        .setBackgroundColor(BG_VERDE);

                badges.add(txtAnt).add(espacio).add(txtNue);
                celda.add(badges);
            }
        } catch (Exception e) {
            // Si el JSON se rompe por alguna razón, mostramos el texto plano formateado
            celda.add(new Paragraph(formatearJsonParaExcel(jsonStr)).setFontSize(8));
        }

        return celda;
    }

    private String formatearJsonParaExcel(String json) {
        if (json == null || json.trim().isEmpty() || json.equals("{}")) { return ""; }
        String limpio = json.replace("{", "").replace("}", "").replace("\"", "");
        return limpio.replace(",", "\n").replace(":", ": ");
    }

    public List<Map<String, Object>> getSesiones() {
        List<Object[]> rows = entityManager.createNativeQuery("SELECT * FROM seguridad.fn_obtener_sesiones()").getResultList();
        return rows.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("loginName",   row[0]); map.put("fechaInicio", row[1]);
            map.put("fechaCierre", row[2]); map.put("ipAddress",   row[3]);
            map.put("navegador",   row[4]); map.put("accion",      row[5]);
            return map;
        }).toList();
    }
}