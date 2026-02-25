package com.example.demo.service;

import com.example.demo.dto.ReporteOfertaDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExportacionService {

    public ByteArrayInputStream exportarExcel(List<ReporteOfertaDTO> datos) throws IOException {
        // Uso de try-with-resources para cerrar el workbook automáticamente
        try (Workbook workbook = new XSSFWorkbook()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Sheet sheet = workbook.createSheet("Ofertas");

            // Crear estilo de negrita para encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Encabezado
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Título", "Empresa", "Ciudad", "Categoría", "Salario Promedio"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Datos
            int rowIdx = 1;
            for (ReporteOfertaDTO d : datos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getIdOferta() != null ? d.getIdOferta() : 0L);
                row.createCell(1).setCellValue(d.getTitulo() != null ? d.getTitulo() : "");
                row.createCell(2).setCellValue(d.getEmpresaNombre() != null ? d.getEmpresaNombre() : "");
                row.createCell(3).setCellValue(d.getCiudad() != null ? d.getCiudad() : "");
                row.createCell(4).setCellValue(d.getCategoria() != null ? d.getCategoria() : "");
                row.createCell(5).setCellValue(d.getSalarioPromedio() != null ? d.getSalarioPromedio().doubleValue() : 0.0);
            }

            // Autoajustar columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream exportarPdf(List<ReporteOfertaDTO> datos) {
        Document document = new Document(PageSize.A4.rotate()); // Horizontal
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título del PDF
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("Reporte de Ofertas Laborales", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Tabla con 6 columnas
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);

            // Encabezados
            String[] headers = {"ID", "Título", "Empresa", "Ciudad", "Categoría", "Salario"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Datos
            for (ReporteOfertaDTO d : datos) {
                table.addCell(String.valueOf(d.getIdOferta()));
                table.addCell(d.getTitulo());
                table.addCell(d.getEmpresaNombre());
                table.addCell(d.getCiudad());
                table.addCell(d.getCategoria());
                table.addCell(d.getSalarioPromedio() != null ? d.getSalarioPromedio().toString() : "0.00");
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error crítico generando PDF: " + e.getMessage());
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}