package com.example.demo.service.Impl;

import com.example.demo.dto.ItemEvaluacionDTO;
import com.example.demo.dto.PerfilPostulanteDTO;
import com.example.demo.dto.PostulanteResumenDTO;
import com.example.demo.dto.ResumenPerfilBaseDTO;
import com.example.demo.dto.ResumenSeccionDTO;
import com.example.demo.repository.Impl.PostulacionCustomRepository;
import com.example.demo.repository.PostulacionRepository;
import com.example.demo.repository.Views.IMisPostulaciones;
import com.example.demo.repository.Views.IOfertaDatosIaDTO;
import com.example.demo.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostulacionServiceImpl implements IPostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final AzureStorageConfig azureStorageConfig;
    private final PostulacionCustomRepository postulacionCustomRepository;
    private final NotificacionService notificacionService;
    private final IPdfService iPdfService;
    private final GeminiAiService geminiAiService;



    @Override
    @Transactional(rollbackFor = Exception.class) // VITAL: Si el CV es inválido o Gemini falla, se cancela todo
    public void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception {

        String urlCv = null;
        int porcentajeMatch = 0;
        String jsonAnalisis = null;

        if (archivo != null && !archivo.isEmpty()) {

            // 1. Extraemos el texto del PDF
            String textoCv = iPdfService.extraerTextoDePdf(archivo);
            if (textoCv == null || textoCv.isBlank() || textoCv.length() < 50) {
                throw new IllegalArgumentException("El documento no contiene texto legible o está vacío. Asegúrate de subir un PDF válido.");
            }

            // 2. Traemos los datos de la oferta usando tu majestuosa Interfaz
            IOfertaDatosIaDTO datosOferta = postulacionRepository.obtenerDatosOfertaParaIa(idOferta);
            if (datosOferta == null) {
                throw new IllegalArgumentException("No se encontró la oferta laboral especificada.");
            }

            // 3. Armamos los requisitos para Gemini
            String requisitosOferta = String.format(
                    "Experiencia mínima requerida: %d años. Habilidades técnicas: %s. Otros requisitos: %s",
                    datosOferta.getExperienciaMinima() != null ? datosOferta.getExperienciaMinima() : 0,
                    datosOferta.getHabilidades(),
                    datosOferta.getRequisitos()
            );

            // 4. Mandamos a la IA a trabajar
            JsonNode analisisIa = geminiAiService.analizarCvConOferta(
                    textoCv,
                    datosOferta.getTitulo(),
                    datosOferta.getDescripcion(),
                    requisitosOferta
            );

            // 5. Validamos si la IA aprobó el documento como un "CV real"
            boolean cvValido = analisisIa.path("cv_valido").asBoolean(true);
            if (!cvValido) {
                String motivo = analisisIa.path("motivo_invalidez").asText("El documento no cumple con los estándares mínimos de un CV.");
                throw new IllegalArgumentException("Tu postulación fue rechazada automáticamente: " + motivo);
            }

            // 6. Extraemos los resultados
            porcentajeMatch = analisisIa.path("match_oferta").path("porcentaje").asInt(0);
            jsonAnalisis = analisisIa.toString();

            // 7. AHORA SÍ, como todo es válido, subimos el PDF a Azure
            urlCv = azureStorageConfig.subirDocumento(archivo);
        }

        // 8. Guardamos en la Base de Datos llamando a tu procedure (con los nuevos campos)
        postulacionRepository.registrarPostulacionPro(idUsuario, idOferta, urlCv, porcentajeMatch, jsonAnalisis);

        // 9. Notificación a la empresa (Se mantiene intacto)
        try {
            List<Object[]> datosOferta = postulacionRepository.obtenerDatosEmpresaPorOfertaId(idOferta);

            if (!datosOferta.isEmpty()) {
                Object[] fila = datosOferta.get(0);
                Long idUsuarioEmpresa = ((Number) fila[0]).longValue();
                String tituloOferta = (String) fila[1];

                notificacionService.crearYEnviarNotificacion(
                        idUsuarioEmpresa,
                        "nueva_postulacion",
                        Map.of("titulo", tituloOferta),
                        Map.of("idOferta", idOferta, "idCandidato", idUsuario),
                        "/menu-principal/gestion-ofertas",
                        "person_add"
                );
            }
        } catch (Exception e) {
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
