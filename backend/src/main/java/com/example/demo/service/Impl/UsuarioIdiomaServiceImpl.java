package com.example.demo.service.Impl;

import com.example.demo.service.IUsuarioIdiomaService;
import com.example.demo.repository.UsuarioIdiomaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UsuarioIdiomaServiceImpl implements IUsuarioIdiomaService {

    @Autowired
    private UsuarioIdiomaRepository usuarioIdiomaRepository;

    @Override
    @Transactional
    public void registrarIdiomaConCertificado(Long idU, Integer idI, String nivel, MultipartFile archivo, String cod) {
        try {
            byte[] contenidoArchivo = (archivo != null) ? archivo.getBytes() : null;
            usuarioIdiomaRepository.registrarIdiomaPro(idU, idI, nivel, contenidoArchivo, cod);
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el idioma: " + e.getMessage());
        }
    }
}