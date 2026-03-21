package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.repository.Impl.PerfilProfesionalRepository;
import com.example.demo.repository.Impl.PostulacionCustomRepository;
import com.example.demo.repository.PostulacionRepository;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
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
    private final PerfilProfesionalRepository perfilProfesionalRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final EmailService emailService;


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void registrarPostulacion(Long idUsuario, Integer idOferta, MultipartFile archivo) throws Exception {

        String urlCv = null;
        int porcentajeMatch = 0;
        String jsonAnalisis = null;
        PerfilProfesionalDTO perfilUsuario = null;
        if (archivo != null && !archivo.isEmpty()) {


            String textoCv = iPdfService.extraerTextoDePdf(archivo);
            if (textoCv == null || textoCv.isBlank() || textoCv.length() < 50) {
                throw new IllegalArgumentException("El documento no contiene texto legible o está vacío. Asegúrate de subir un PDF válido.");
            }


            IOfertaDatosIaDTO datosOferta = postulacionRepository.obtenerDatosOfertaParaIa(idOferta);
            if (datosOferta == null) {
                throw new IllegalArgumentException("No se encontró la oferta laboral especificada.");
            }
             perfilUsuario = perfilProfesionalRepository.obtenerPerfilCompleto(idUsuario);


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
                    requisitosOferta,
                    perfilUsuario
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

        // 9. Notificación a la empresa y al candidato
        try {
            List<Object[]> datosEmpresa = postulacionRepository.obtenerDatosEmpresaPorOfertaId(idOferta);

            if (!datosEmpresa.isEmpty()) {
                Object[] fila = datosEmpresa.get(0);
                Long idUsuarioEmpresa = ((Number) fila[0]).longValue();
                String tituloOferta = (String) fila[1];

                var usuarioCandidato = usuarioRepository.findById(idUsuario).orElse(null);

                String nombreCandidato = (usuarioCandidato != null)
                        ? usuarioCandidato.getNombre() + " " + (usuarioCandidato.getApellido() != null ? usuarioCandidato.getApellido() : "")
                        : "Candidato";

                String nombreCompleto = (usuarioCandidato != null)
                        ? usuarioCandidato.getNombre() + " " + (usuarioCandidato.getApellido() != null ? usuarioCandidato.getApellido() : "")
                        : "Candidato";
                String nombreEmpresa = usuarioEmpresaRepository.findById(idUsuarioEmpresa)
                        .map(e -> e.getUsuario() != null ? e.getUsuario().getNombre() : "La Empresa")
                        .orElse("La Empresa");

                //  NOTIFICACIÓN WEB
                String carreraLimpia = "Profesional";
                if (perfilUsuario != null && perfilUsuario.getFormacionAcademica() != null) {
                    String rawCarrera = perfilUsuario.getFormacionAcademica();

                    if (rawCarrera.contains("[")) {
                        carreraLimpia = rawCarrera.replaceAll(".*?\"carrera\":\\s*\"([^\"]+)\".*?", "$1, ")
                                .replaceAll(", $", "") // Quita la última coma
                                .replaceAll("(\\[|\\{).*?(\\]|\\})", "");

                          carreraLimpia = "Múltiples carreras (Ver detalles en perfil)";
                    } else {
                        carreraLimpia = rawCarrera;
                    }
                }
                notificacionService.crearYEnviarNotificacion(
                        idUsuarioEmpresa,
                        "nueva_postulacion",
                        Map.of("titulo", tituloOferta),
                        Map.of("idOferta", idOferta, "idCandidato", idUsuario),
                        "/menu-principal/gestion-ofertas",
                        "person_add"
                );

                // --- EMAIL DETALLADO (El hack se encarga de que sea solo email) ---
                // Usamos 'perfilUsuario' que ya consultaste arriba en el paso 3

                notificacionService.crearYEnviarNotificacion(
                        idUsuarioEmpresa,
                        "email_postulacion_recibida",
                        Map.of(
                                "empresaNombre", nombreEmpresa,
                                "ofertaTitulo", tituloOferta,
                                "candidatoNombre", nombreCompleto,
                                "candidatoEmail", usuarioCandidato != null ? usuarioCandidato.getCorreo() : "No disponible",
                                "candidatoTelefono", (perfilUsuario != null && perfilUsuario.getTelefono() != null) ? perfilUsuario.getTelefono() : "No registrado",

                                // USA LA VARIABLE LIMPIA AQUÍ
                                "candidatoCarrera", carreraLimpia,

                                "resumenCV", "Match de IA: " + porcentajeMatch + "%. El candidato posee formación en el área requerida."
                        ),
                        Map.of("idOferta", idOferta),
                        "/menu-principal/gestion-ofertas",
                        "email"
                );

                // --- NOTIFICACIÓN AL CANDIDATO ---
                notificacionService.crearYEnviarNotificacion(
                        idUsuario,
                        "in_app_postulacion_recibida",
                        Map.of(
                                "candidatoNombre", nombreCandidato,
                                "empresaNombre", nombreEmpresa,
                                "ofertaTitulo", tituloOferta
                        ),
                        Map.of("idOferta", idOferta),
                        "/menu-principal/mis-postulaciones",
                        "send"
                );
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error en el flujo de notificaciones: " + e.getMessage());
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

        try {
            List<Object[]> datos = postulacionRepository.obtenerDatosParaNotificacion(Math.toIntExact(idPostulacion));

            if (!datos.isEmpty()) {
                Object[] fila = datos.get(0);
                Long idCandidatoReal = (Long) fila[0];
                String tituloOfertaReal = (String) fila[1];
                String nombreEmpresaReal = (String) fila[2];
                String correoDeLaEmpresa = (String) fila[3];

                String nombreCandidato = usuarioRepository.findById(idCandidatoReal)
                        .map(u -> u.getNombre() + " " + (u.getApellido() != null ? u.getApellido() : ""))
                        .orElse("Candidato").trim();

                if ("aprobado".equalsIgnoreCase(estado)) {
                    // Notificación Candidato Aprobado
                    notificacionService.crearYEnviarNotificacion(
                            idCandidatoReal,
                            "in_app_postulacion_aceptada",
                            Map.of(
                                    "candidatoNombre", nombreCandidato,
                                    "empresaNombre", nombreEmpresaReal,
                                    "ofertaTitulo", tituloOfertaReal,
                                    "correoEmpresa", correoDeLaEmpresa
                            ),
                            Map.of("idPostulacion", idPostulacion),
                            "/menu-principal/mis-postulaciones",
                            "check_circle"
                    );
                } else if ("rechazado".equalsIgnoreCase(estado)) {
                    // Notificación Candidato Rechazado
                    notificacionService.crearYEnviarNotificacion(
                            idCandidatoReal,
                            "in_app_postulacion_rechazada",
                            Map.of(
                                    "candidatoNombre", nombreCandidato,
                                    "empresaNombre", nombreEmpresaReal,
                                    "ofertaTitulo", tituloOfertaReal
                            ),
                            Map.of("idPostulacion", idPostulacion),
                            "/menu-principal/mis-postulaciones",
                            "cancel"
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Error enviando notificacion de postulacion evaluada: " + e.getMessage());
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
