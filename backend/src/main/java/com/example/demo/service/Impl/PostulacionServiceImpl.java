package com.example.demo.service.Impl;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPerfilBaseDTO;
import com.example.demo.dto.ResumenSeccionDTO;
import com.example.demo.repository.Impl.PostulacionCustomRepository;
import com.example.demo.repository.PostulacionRepository;
import com.example.demo.repository.Views.IMisPostulaciones;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IPostulacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.service.NotificacionService;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostulacionServiceImpl implements IPostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final AzureStorageConfig azureStorageConfig;
    private final PostulacionCustomRepository postulacionCustomRepository;
    private final NotificacionService notificacionService;


    @Override
    @Transactional
    public void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception {
        String urlCv = null;
        if (archivo != null && !archivo.isEmpty()) {
            urlCv = azureStorageConfig.subirDocumento(archivo);
        }
        postulacionRepository.registrarPostulacionPro(idUsuario, idOferta, urlCv);
        try {
            List<Object[]> datosOferta = postulacionRepository.obtenerDatosEmpresaPorOfertaId(idOferta);

            if (!datosOferta.isEmpty()) {
                Object[] fila = datosOferta.get(0);
                Long idUsuarioEmpresa = ((Number) fila[0]).longValue();
                String tituloOferta = (String) fila[1];

                notificacionService.crearYEnviarNotificacion(
                        idUsuarioEmpresa,                    // Para la empresa
                        "nueva_postulacion",                 // El tipo de plantilla
                        Map.of("titulo", tituloOferta),      // Variables para el texto
                        Map.of("idOferta", idOferta, "idCandidato", idUsuario), // Datos extra
                        "/menu-principal/gestion-ofertas",    // Ruta donde la empresa ve sus ofertas/postulantes
                        "person_add"                         // Icono
                );
            }
        } catch (Exception e) {
            // Si la notificación falla, no bloqueamos la postulación del candidato
            System.err.println("Error enviando notificación a la empresa: " + e.getMessage());
        }


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
    @Transactional
    public void evaluarPostulacionGeneral(Long idPostulacion, String estado, String mensaje) {

        postulacionCustomRepository.evaluarPostulacionGeneral(idPostulacion, estado, mensaje);

        if ("aprobado".equalsIgnoreCase(estado)) {
            try {
                List<Object[]> datos = postulacionRepository.obtenerDatosParaNotificacion(Math.toIntExact(idPostulacion));

                if (!datos.isEmpty()) {
                    Object[] fila = datos.get(0);
                    Long idCandidatoReal = (Long) fila[0];
                    String tituloOfertaReal = (String) fila[1];
                    String nombreEmpresaReal = (String) fila[2];

                    notificacionService.crearYEnviarNotificacion(
                            idCandidatoReal,
                            "postulacion_aprobada",
                            Map.of(
                                    "oferta", tituloOfertaReal,
                                    "empresa", nombreEmpresaReal
                            ),
                            Map.of("idPostulacion", idPostulacion),
                            "/menu-principal/mis-postulaciones",
                            "check_circle"
                    );
                }
            } catch (Exception e) {
                System.err.println("Error enviando notificacion de postulacion aprobada: " + e.getMessage());
            }
        }
    }


    @Override
    public List<IMisPostulaciones> listarMisPostulaciones(Long idUsuario) {
        return postulacionRepository.listarMisPostulaciones(idUsuario);
    }

    @Override
    public ResumenPerfilBaseDTO obtenerPerfilBase(Long idPostulacion) {
        return postulacionCustomRepository.obtenerPerfilBase(idPostulacion);
    }

    @Override
    public List<ResumenSeccionDTO> obtenerFormacion(Long idPostulacion) {
        return postulacionCustomRepository.obtenerFormacion(idPostulacion);
    }

    @Override
    public List<ResumenSeccionDTO> obtenerExperiencia(Long idPostulacion) {
        return postulacionCustomRepository.obtenerExperiencia(idPostulacion);
    }

    @Override
    public List<ResumenSeccionDTO> obtenerCursos(Long idPostulacion) {
        return postulacionCustomRepository.obtenerCursos(idPostulacion);
    }

    @Override
    public List<ResumenSeccionDTO> obtenerIdiomas(Long idPostulacion) {
        return postulacionCustomRepository.obtenerIdiomas(idPostulacion);
    }
}
