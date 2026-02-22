package com.example.demo.service.Impl;

import com.example.demo.repository.PostulacionRepository;
import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PostulacionServiceImpl implements IPostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception {
        String urlCv = null;

        // Si hay archivo, subirlo a Cloudinary
        if (archivo != null && !archivo.isEmpty()) {
            urlCv = cloudinaryService.subirImagenEArchivo(archivo);
        }

        // Llamar al SP para registrar la postulación
        postulacionRepository.registrarPostulacionPro(idUsuario, idOferta, urlCv);
    }

    @Override
    @Transactional
    public void cancelarPostulacion(Integer idPostulacion) {
        postulacionRepository.cancelarPostulacionPro(idPostulacion);
    }

    @Override
    public String obtenerUrlCV(Integer idPostulacion) {
        return postulacionRepository.obtenerUrlCvFn(idPostulacion);
    }
}

