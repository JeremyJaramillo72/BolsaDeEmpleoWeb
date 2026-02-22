package com.example.demo.service.Impl;

import com.example.demo.repository.PerfilAcademicoRepository;
import com.example.demo.service.IPerfilAcademicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class PerfilAcademicoServiceImpl implements IPerfilAcademicoService {

    @Autowired
    private PerfilAcademicoRepository perfilAcademicoRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    @Transactional // 👈 Importante para asegurar la ejecución del procedimiento
    public void registrarNuevoTitulo(Long idUsuario, Integer idCarrera, LocalDate fecha, String senescyt, String urlArchivo) {
        // Llamamos al repositorio que ejecuta el procedimiento almacenado sp_registrar_perfil_academico
        perfilAcademicoRepository.registrarPerfilCompletoPro(
                idUsuario,
                idCarrera,
                fecha,
                senescyt,
                urlArchivo
        );
    }

    // Método auxiliar para subir el archivo a Cloudinary y retornar la URL
    public String subirArchivoCloudinary(MultipartFile archivo) throws IOException {
        return cloudinaryService.subirImagenEArchivo(archivo);
    }
}