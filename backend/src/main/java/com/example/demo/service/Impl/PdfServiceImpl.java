package com.example.demo.service.Impl;

import com.example.demo.service.IPdfService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;

@Service
public class PdfServiceImpl implements IPdfService {
    public String extraerTextoDePdf(MultipartFile archivo) {
        try (PDDocument document = Loader.loadPDF(archivo.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            String texto = stripper.getText(document);
            return texto.replaceAll("\\r\\n|\\r|\\n", " ").trim();

        } catch (Exception e) {
            System.err.println("Error al leer el PDF: " + e.getMessage());
            return null;
        }
    }

}

