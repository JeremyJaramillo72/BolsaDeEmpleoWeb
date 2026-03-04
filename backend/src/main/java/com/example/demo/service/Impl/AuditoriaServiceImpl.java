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

@Service
public class AuditoriaServiceImpl implements IAuditoriaService {

    @PersistenceContext
    private EntityManager entityManager;

    // ✅ 1. Obtener todos los usuarios
    @Override
    public List<Map<String, Object>> obtenerTodosUsuarios() {
        // Ejecutamos la consulta nativa llamando a la función corregida
        List<Object[]> resultados = entityManager
                .createNativeQuery(
                        "SELECT id_usuario, nombre, apellido, correo, fecha_registro, " +
                                "estado_validacion, nombre_rol, ultimo_acceso, total_auditorias " +
                                "FROM seguridad.fn_obtener_todos_usuarios()"
                )
                .getResultList();

        List<Map<String, Object>> lista = new ArrayList<>();

        for (Object[] row : resultados) {
            Map<String, Object> map = new LinkedHashMap<>(); // LinkedHashMap para mantener el orden si prefieres

            map.put("idUsuario",        row[0]); // Ya viene como Long/BigInteger por el bigint de la DB
            map.put("nombre",           row[1] != null ? row[1].toString() : "");
            map.put("apellido",         row[2] != null ? row[2].toString() : "");
            map.put("correo",           row[3] != null ? row[3].toString() : "");
            map.put("fechaRegistro",    row[4]); // Puedes pasarlo directo si Jackson lo serializa
            map.put("estadoValidacion", row[5] != null ? row[5].toString() : "PENDIENTE");

            // Estructura de Rol como objeto anidado
            Map<String, String> rolMap = new HashMap<>();
            rolMap.put("nombreRol",     row[6] != null ? row[6].toString() : "SIN ROL");
            map.put("rol",              rolMap);

            map.put("ultimoAcceso",     row[7]);

            // Manejo seguro del bigint (total_auditorias)
            map.put("totalAuditorias",  row[8] != null ? ((Number) row[8]).longValue() : 0L);

            lista.add(map);
        }
        return lista;
    }

    // ✅ 2. Estadísticas de usuarios
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

    // ✅ 3. Auditorías por usuario
    @Override
    public List<AuditoriaDTO> getAuditoriasUsuario(Integer idUsuario) {
        List<Object[]> resultados = entityManager
                .createNativeQuery(
                        "SELECT id_auditoria, usuario_db::text, fecha_hora, " +
                                "accion::text, tabla_afectada::text, id_registro_afectado, " +
                                "datos_anteriores::text, datos_nuevos::text " +
                                "FROM seguridad.fn_reporte_auditoria_usuario(:idUsuario)"
                )
                .setParameter("idUsuario", idUsuario)
                .getResultList();

        return resultados.stream().map(row -> new AuditoriaDTO(
                row[0] != null ? ((Number) row[0]).intValue() : null,     // id_auditoria
                row[1] != null ? row[1].toString() : null,               // usuario_db
                null, // 👈 Aquí pasamos null o un string vacío porque quitamos el LoginName del DTO
                row[2] != null ? (row[2] instanceof java.sql.Timestamp ?
                        ((java.sql.Timestamp) row[2]).toLocalDateTime() :
                        (java.time.LocalDateTime) row[2]) : null,            // fecha_hora (ahora es índice 2)
                row[3] != null ? row[3].toString() : null,               // accion (ahora índice 3)
                row[4] != null ? row[4].toString() : null,               // tabla_afectada (ahora índice 4)
                row[5] != null ? ((Number) row[5]).intValue() : null,    // id_registro_afectado (ahora índice 5)
                row[6] != null ? row[6].toString() : null,               // datos_anteriores (ahora índice 6)
                row[7] != null ? row[7].toString() : null                // datos_nuevos (ahora índice 7)
        )).toList();
    }

    // ✅ 4. Resumen auditorías por usuario
    @Override
    public ResumenAuditoriaDTO getResumenAuditoria(Integer idUsuario) {
        // Ahora que es FUNCTION, el SELECT * funciona perfectamente
        Object[] res = (Object[]) entityManager
                .createNativeQuery("SELECT * FROM seguridad.fn_resumen_auditoria_usuario(:idUsuario)")
                .setParameter("idUsuario", idUsuario)
                .getSingleResult();

        ResumenAuditoriaDTO dto = new ResumenAuditoriaDTO();
        if (res != null) {
            dto.setTotalAcciones(res[0] != null ? ((Number) res[0]).intValue() : 0);

            // Manejo seguro de la fecha que ya corregimos antes
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

    // ✅ 5. Exportar usuarios Excel
    @Override
    public byte[] exportarUsuariosExcel(Map<String, Object> body) {
        List<Map<String, Object>> usuarios = obtenerTodosUsuarios();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Usuarios");

            // Estilo de encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Agregué "Total Auditorías" para aprovechar la función SQL
            String[] columnas = {"ID", "Nombre", "Apellido", "Correo", "Registro", "Estado", "Rol", "Último Acceso", "Auditorías"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Map<String, Object> user : usuarios) {
                Row row = sheet.createRow(rowIdx++);

                // Uso de un método auxiliar o validación inline para evitar NullPointerException
                row.createCell(0).setCellValue(user.get("idUsuario") != null ? user.get("idUsuario").toString() : "");
                row.createCell(1).setCellValue(Objects.toString(user.get("nombre"), ""));
                row.createCell(2).setCellValue(Objects.toString(user.get("apellido"), ""));
                row.createCell(3).setCellValue(Objects.toString(user.get("correo"), ""));
                row.createCell(4).setCellValue(Objects.toString(user.get("fechaRegistro"), ""));
                row.createCell(5).setCellValue(Objects.toString(user.get("estadoValidacion"), ""));

                // Manejo seguro del mapa de Rol
                Object rolObj = user.get("rol");
                String nombreRol = "Sin Rol";
                if (rolObj instanceof Map) {
                    nombreRol = Objects.toString(((Map<?, ?>) rolObj).get("nombreRol"), "Sin Rol");
                }
                row.createCell(6).setCellValue(nombreRol);

                row.createCell(7).setCellValue(Objects.toString(user.get("ultimoAcceso"), "N/A"));

                // Nueva columna con el conteo que viene de la DB
                row.createCell(8).setCellValue(user.get("totalAuditorias") != null ? user.get("totalAuditorias").toString() : "0");
            }

            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            // En lugar de printStackTrace, lo ideal es logear el error
            System.err.println("Error generando Excel: " + e.getMessage());
            return new byte[0];
        }
    }

    // ✅ 6. Exportar auditorías Excel
    @Override
    public byte[] exportarAuditoriasExcel(Integer idUsuario) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuario(idUsuario);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Reporte_Auditoria");

            // 1. Estilo para el encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 2. Estilo para las celdas JSON (Wrap Text y Alineación superior)
            CellStyle jsonStyle = workbook.createCellStyle();
            jsonStyle.setWrapText(true);
            jsonStyle.setVerticalAlignment(VerticalAlignment.TOP);

            String[] columnas = {"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Registro", "Datos Ant.", "Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
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

                // Usamos el método formatearJsonParaExcel en ambos
                // Usamos String.valueOf() para convertir el Object a String de forma segura
                Cell cellAnt = row.createCell(6);
                cellAnt.setCellValue(formatearJsonParaExcel(String.valueOf(aud.getDatosAnteriores())));
                cellAnt.setCellStyle(jsonStyle);

                Cell cellNue = row.createCell(7);
                cellNue.setCellValue(formatearJsonParaExcel(String.valueOf(aud.getDatosNuevos())));
                cellNue.setCellStyle(jsonStyle);
            }

            // 3. Ajuste de ancho
            for (int i = 0; i <= 5; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.setColumnWidth(6, 12000);
            sheet.setColumnWidth(7, 12000);

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generando Excel de Auditoría: " + e.getMessage());
            return new byte[0];
        }
    }
    @Override
    public List<AuditoriaDTO> getAuditoriasUsuarioPorTipo(Integer idUsuario, String tipo) {
        // Reutilizamos la función existente y filtramos en Java
        // (igual que: SELECT * FROM fn_reporte_auditoria_usuario(:id) WHERE accion = :tipo)
        return getAuditoriasUsuario(idUsuario)
                .stream()
                .filter(a -> a.getAccion() != null &&
                        a.getAccion().equalsIgnoreCase(tipo))
                .toList();
    }

    // ✅ Exportar Excel filtrado por tipo
    @Override
    public byte[] exportarAuditoriasExcelPorTipo(Integer idUsuario, String tipo) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuarioPorTipo(idUsuario, tipo);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Auditoria_" + tipo.toUpperCase());

            // Estilo encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Color según tipo
            switch (tipo.toUpperCase()) {
                case "INSERT" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
                case "DELETE" -> headerStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
                case "UPDATE" -> headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                default       -> headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            }
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Estilo JSON
            CellStyle jsonStyle = workbook.createCellStyle();
            jsonStyle.setWrapText(true);
            jsonStyle.setVerticalAlignment(VerticalAlignment.TOP);

            String[] columnas = {"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Registro", "Datos Ant.", "Datos Nuevos"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
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

                Cell cellAnt = row.createCell(6);
                cellAnt.setCellValue(formatearJsonParaExcel(String.valueOf(aud.getDatosAnteriores())));
                cellAnt.setCellStyle(jsonStyle);

                Cell cellNue = row.createCell(7);
                cellNue.setCellValue(formatearJsonParaExcel(String.valueOf(aud.getDatosNuevos())));
                cellNue.setCellStyle(jsonStyle);
            }

            for (int i = 0; i <= 5; i++) sheet.autoSizeColumn(i);
            sheet.setColumnWidth(6, 12000);
            sheet.setColumnWidth(7, 12000);

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generando Excel filtrado: " + e.getMessage());
            return new byte[0];
        }
    }

    // ✅ Exportar PDF filtrado por tipo
    @Override
    public byte[] exportarAuditoriasPdfPorTipo(Integer idUsuario, String tipo) {
        List<AuditoriaDTO> auditorias = getAuditoriasUsuarioPorTipo(idUsuario, tipo);

        // Usamos iText 7 (asegúrate de tener la dependencia en pom.xml)
        // <dependency>
        //   <groupId>com.itextpdf</groupId>
        //   <artifactId>itext7-core</artifactId>
        //   <version>7.2.5</version>
        //   <type>pom</type>
        // </dependency>

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
            com.itextpdf.kernel.pdf.PdfDocument pdf   = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document      = new com.itextpdf.layout.Document(pdf,
                    com.itextpdf.kernel.geom.PageSize.A4.rotate()); // horizontal para las columnas

            // Título
            com.itextpdf.layout.element.Paragraph titulo =
                    new com.itextpdf.layout.element.Paragraph("Reporte de Auditorías — " + tipo.toUpperCase())
                            .setFontSize(16)
                            .setBold()
                            .setMarginBottom(15);
            document.add(titulo);

            // Subtítulo con fecha
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Generado: " + java.time.LocalDateTime.now()
                            .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFontSize(9)
                    .setFontColor(com.itextpdf.kernel.colors.ColorConstants.GRAY)
                    .setMarginBottom(20));

            // Tabla
            float[] anchos = {1f, 2f, 2.5f, 1.5f, 2f, 1.5f, 3f, 3f};
            com.itextpdf.layout.element.Table tabla =
                    new com.itextpdf.layout.element.Table(anchos).useAllAvailableWidth();

            // Encabezados
            String[] headers = {"ID", "Usuario DB", "Fecha/Hora", "Acción", "Tabla", "ID Reg.", "Datos Ant.", "Datos Nuevos"};
            for (String h : headers) {
                tabla.addHeaderCell(
                        new com.itextpdf.layout.element.Cell()
                                .add(new com.itextpdf.layout.element.Paragraph(h).setBold().setFontSize(9))
                                .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY)
                                .setPadding(6)
                );
            }

            // Filas
            boolean par = false;
            com.itextpdf.kernel.colors.Color bgPar = new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 250);
            for (AuditoriaDTO aud : auditorias) {
                com.itextpdf.kernel.colors.Color bg = par ? bgPar : com.itextpdf.kernel.colors.ColorConstants.WHITE;

                tabla.addCell(celdaPdf(String.valueOf(aud.getIdAuditoria() != null ? aud.getIdAuditoria() : ""), bg));
                tabla.addCell(celdaPdf(Objects.toString(aud.getUsuarioDb(), "N/A"), bg));
                tabla.addCell(celdaPdf(Objects.toString(aud.getFechaHora(), ""), bg));
                tabla.addCell(celdaPdf(Objects.toString(aud.getAccion(), ""), bg));
                tabla.addCell(celdaPdf(Objects.toString(aud.getTablaAfectada(), ""), bg));
                tabla.addCell(celdaPdf(String.valueOf(aud.getIdRegistroAfectado() != null ? aud.getIdRegistroAfectado() : ""), bg));
                tabla.addCell(celdaPdf(formatearJsonParaExcel(String.valueOf(aud.getDatosAnteriores())), bg));
                tabla.addCell(celdaPdf(formatearJsonParaExcel(String.valueOf(aud.getDatosNuevos())), bg));
                par = !par;
            }

            document.add(tabla);

            // Pie de página con total
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Total de registros: " + auditorias.size())
                    .setFontSize(9)
                    .setMarginTop(15));

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generando PDF: " + e.getMessage());
            return new byte[0];
        }
    }

    // Método auxiliar para celdas PDF (agrega este método privado en la clase)
    private com.itextpdf.layout.element.Cell celdaPdf(String valor,
                                                      com.itextpdf.kernel.colors.Color bg) {
        return new com.itextpdf.layout.element.Cell()
                .add(new com.itextpdf.layout.element.Paragraph(
                        valor != null ? valor : "").setFontSize(8))
                .setBackgroundColor(bg)
                .setPadding(4);
    }


    private String formatearJsonParaExcel(String json) {
        if (json == null || json.trim().isEmpty() || json.equals("{}")) {
            return "";
        }
        // Quitamos llaves y comillas
        String limpio = json.replace("{", "").replace("}", "").replace("\"", "");
        // Ponemos cada campo en una línea nueva para que parezca una tablita
        return limpio.replace(",", "\n").replace(":", ": ");
    }

    public List<Map<String, Object>> getSesiones() {
        List<Object[]> rows = entityManager
                .createNativeQuery("SELECT * FROM seguridad.fn_obtener_sesiones()")
                .getResultList();

        return rows.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("loginName",   row[0]);
            map.put("fechaInicio", row[1]);
            map.put("fechaCierre", row[2]);
            map.put("ipAddress",   row[3]);
            map.put("navegador",   row[4]);
            map.put("accion",      row[5]);
            return map;
        }).toList();
    }
}