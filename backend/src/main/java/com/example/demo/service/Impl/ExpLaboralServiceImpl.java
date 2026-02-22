package com.example.demo.service.Impl;

import com.example.demo.repository.ExpLaboralRepository;
import com.example.demo.service.IExpLaboralService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class ExpLaboralServiceImpl implements IExpLaboralService {

    @Autowired
    private ExpLaboralRepository expLaboralRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public void registrarExpLaboral(Long idUsuario, Integer idCargo, Integer idEmpresaCatalogo,
                                     LocalDate fechaInicio, LocalDate fechaFin,
                                     String descripcion, String ubicacion, MultipartFile archivo) {
        try {
            // Si hay comprobante, lo subimos a Cloudinary y usamos la URL
            String urlComprobante = null;
            if (archivo != null && !archivo.isEmpty()) {
                urlComprobante = cloudinaryService.subirImagenEArchivo(archivo);
            }

            expLaboralRepository.registrarExpLaboralPro(
                    idUsuario,
                    idCargo,
                    idEmpresaCatalogo,
                    fechaInicio,
                    fechaFin,
                    descripcion,
                    ubicacion,
                    urlComprobante
            );
        } catch (Exception e) {
            throw new RuntimeException("Error al registrar experiencia laboral: " + e.getMessage());
        }
    }
}

