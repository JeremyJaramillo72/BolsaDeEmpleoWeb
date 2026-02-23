package com.example.demo.service.Impl;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.repository.Impl.PostulacionCustomRepository;
import com.example.demo.repository.PostulacionRepository;
import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostulacionServiceImpl implements IPostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final CloudinaryService cloudinaryService;
    private final PostulacionCustomRepository postulacionCustomRepository;

    @Override
    @Transactional
    public void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception {
        String urlCv = null;


        if (archivo != null && !archivo.isEmpty()) {
            urlCv = cloudinaryService.subirImagenEArchivo(archivo);
        }


        postulacionRepository.registrarPostulacionPro(idUsuario, idOferta, urlCv);
    }

    @Override
    @Transactional
    public void cancelarPostulacion(Integer idPostulacion) {
        postulacionRepository.cancelarPostulacionPro(idPostulacion);
    }

    @Override
    public PerfilPostulanteDTO obtenerPerfilDelCandidato(Long idPostulacion) {
        return postulacionCustomRepository.obtenerPerfilCompleto(idPostulacion);
    }

    @Override
    public String obtenerUrlCV(Integer idPostulacion) {
        return postulacionRepository.obtenerUrlCvFn(idPostulacion);
    }

    @Override
    public List<PostulanteResumenDTO> listarCandidatosPorOferta(Long idOferta) {
        return postulacionCustomRepository.obtenerPostulantesPorOferta(idOferta);
    }

    @Override
    public void evaluarItemIndividual(Long idPostulacion, ItemEvaluacionDTO dto) {
        postulacionCustomRepository.evaluarItemIndividual(
                idPostulacion,
                dto.getTipoItem(),
                dto.getIdItem(),
                dto.getEstado(),
                dto.getObservacion()
        );
    }

    @Override
    public void evaluarPostulacionGeneral(Long idPostulacion, String estado, String mensaje) {

        postulacionCustomRepository.evaluarPostulacionGeneral(idPostulacion, estado, mensaje);
    }
}
