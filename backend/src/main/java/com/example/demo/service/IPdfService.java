package com.example.demo.service;

import org.springframework.web.multipart.MultipartFile;

public interface IPdfService {
    String extraerTextoDePdf(MultipartFile archivo);
}
