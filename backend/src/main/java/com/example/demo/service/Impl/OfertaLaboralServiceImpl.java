package com.example.demo.service.Impl;

import com.example.demo.dto.IOfertaResumen;
import com.example.demo.dto.NuevaEmpresaAdminDTO;
import com.example.demo.dto.OfertaExtraInfoDTO;
import com.example.demo.dto.OfertaLaboralDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.repository.Views.IOfertaDetallada;
import com.example.demo.repository.Views.IOfertaEmpresaDTO;
import com.example.demo.repository.Views.IOfertaFisicaAdminDTO;
import com.example.demo.repository.Views.IPostulanteOfertaDTO;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IOfertaLaboralService;
import com.example.demo.service.NotificacionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OfertaLaboralServiceImpl implements IOfertaLaboralService {
    private final OfertaLaboralRepository ofertaRepository;
    private final PostulacionRepository postulacionRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;
    private final NotificacionService notificacionService;
    private final JdbcTemplate jdbcTemplate;
    private final AzureStorageConfig azureStorageConfig;
    private final   PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OfertaLaboral guardarOferta(OfertaLaboralDTO dto) {


        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("el título de la oferta es obligatorio");
        }
        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            throw new IllegalArgumentException("la descripción es obligatoria");
        }
        if (dto.getIdCiudad() == null || dto.getIdCiudad() == 0) {
            throw new IllegalArgumentException("debe seleccionar una provincia y una ciudad válida");
        }
        if (dto.getCantidadVacantes() == null || dto.getCantidadVacantes() < 1) {
            throw new IllegalArgumentException("debe haber al menos 1 vacante");
        }


        if (dto.getSalarioMin() != null && dto.getSalarioMax() != null) {
            if (dto.getSalarioMin().compareTo(dto.getSalarioMax()) > 0) {
                throw new IllegalArgumentException("el salario mínimo no puede ser mayor al salario máximo");
            }
        }
        if (dto.getFechaInicio() != null && dto.getFechaCierre() != null) {
            if (dto.getFechaCierre().isBefore(dto.getFechaInicio())) {
                throw new IllegalArgumentException("la fecha de cierre no puede ser anterior a la fecha de inicio");
            }
        }


        String habilidadesJson = "[]";
        try {
            if (dto.getHabilidades() != null && !dto.getHabilidades().isEmpty()) {
                habilidadesJson = objectMapper.writeValueAsString(dto.getHabilidades());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir habilidades a json", e);
        }

        String requisitosJson = "[]";
        try {
            if (dto.getRequisitos_manuales() != null && !dto.getRequisitos_manuales().isEmpty()) {
                requisitosJson = objectMapper.writeValueAsString(dto.getRequisitos_manuales());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir requisitos manuales a json", e);
        }


        if (dto.getIdOferta() == null || dto.getIdOferta() == 0) {
            ofertaRepository.registrarOferta(
                    dto.getIdEmpresa(),
                    dto.getIdModalidad(),
                    dto.getIdCategoria(),
                    dto.getIdJornada(),
                    dto.getIdCiudad(),
                    dto.getTitulo(),
                    dto.getDescripcion(),
                    dto.getSalarioMin(),
                    dto.getSalarioMax(),
                    dto.getCantidadVacantes(),
                    dto.getExperienciaMinima(),
                    dto.getFechaInicio() != null ? dto.getFechaInicio() : java.time.LocalDate.now(),
                    dto.getFechaCierre(),
                    habilidadesJson,
                    requisitosJson
            );


            // Notificar a admins sobre nueva oferta pendiente
            try {
                Map<String, String> variables = new java.util.HashMap<>();
                variables.put("empresa", dto.getIdEmpresa().toString()); // o el nombre si lo tienes
                variables.put("titulo", dto.getTitulo());

                Map<String, Object> datos = new java.util.HashMap<>();
                datos.put("idEmpresa", dto.getIdEmpresa());
                datos.put("titulo", dto.getTitulo());

                notificacionService.notificarAdminsDirecto(
                        "oferta_pendiente",
                        variables,
                        datos,
                        "/menu-principal/PanelAdmi/ValidarOfertas",
                        "assignment_late"
                );
            } catch (Exception e) {
                System.err.println("⚠️ Warning - Notificación oferta pendiente no guardada: " + e.getMessage());
            }

        } else {
            ofertaRepository.actualizarOferta(
                    dto.getIdOferta(),
                    dto.getIdModalidad(),
                    dto.getIdCategoria(),
                    dto.getIdJornada(),
                    dto.getIdCiudad(),
                    dto.getTitulo(),
                    dto.getDescripcion(),
                    dto.getSalarioMin(),
                    dto.getSalarioMax(),
                    dto.getCantidadVacantes(),
                    dto.getExperienciaMinima(),
                    dto.getEstadoOferta(),
                    dto.getFechaCierre(),
                    habilidadesJson,
                    requisitosJson
            );
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IOfertaEmpresaDTO> listarPorEmpresa(Long idEmpresa) {
        return ofertaRepository.obtenerOfertasPorEmpresa(idEmpresa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaLaboral> listarTodas() {
        return ofertaRepository.findAll();
    }

    @Override
    public List<IPostulanteOfertaDTO> obtenerPostulantes(Long idOferta) {
        return ofertaRepository.obtenerPostulantesPorOferta(idOferta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IOfertaResumen> listarPorEstado(String estadoOferta) {
        return ofertaRepository.listarPorEstadoSP(estadoOferta);
    }

    @Override
    @Transactional
    public void cambiarEstadoOferta(Long idOferta, String nuevoEstado) {

        // Validar que la oferta no esté vencida
        OfertaLaboral oferta = ofertaRepository.findById(idOferta.intValue())
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

        if (oferta.getFechaCierre() != null && oferta.getFechaCierre().isBefore(LocalDate.now())) {
            throw new RuntimeException("No se puede cambiar el estado de una oferta vencida (fecha de cierre: " + oferta.getFechaCierre() + ")");
        }

        // 1. Se actualiza el estado (Esto ya no se va a deshacer si la notificación falla)
        ofertaRepository.actualizarEstadoDirecto(idOferta, nuevoEstado);


        if ("aprobado".equalsIgnoreCase(nuevoEstado)) {
            try {
                List<Object[]> datos = postulacionRepository.obtenerDatosEmpresaPorOfertaId(Math.toIntExact(idOferta));

                if (!datos.isEmpty()) {
                    Object[] fila = datos.get(0);

                    Long idUsuarioEmpresa = ((Number) fila[0]).longValue();
                    String tituloOferta = (String) fila[1];

                    Map<String, String> variablesOferta = new java.util.HashMap<>();
                    variablesOferta.put("titulo", tituloOferta);
                    variablesOferta.put("estado", nuevoEstado);

                    Map<String, Object> datosOferta = new java.util.HashMap<>();
                    datosOferta.put("idOferta", idOferta);

                    notificacionService.crearYEnviarNotificacion(
                            idUsuarioEmpresa,
                            "oferta_aprobada",
                            variablesOferta,
                            datosOferta,
                            "/menu-principal/gestion-ofertas",
                            "campaign"
                    );
                }
            } catch (Exception e) {
                // El catch absorbe el error. La notificación no se enviará, pero la oferta SÍ quedará aprobada.
                System.err.println(" Error al enviar notificación de oferta aprobada: " + e.getMessage());
                e.printStackTrace();
            }

            // Notificar a postulantes de la misma zona (provincia) que la oferta
            try {
                List<Object[]> ubicacion = ofertaRepository.obtenerDatosUbicacionOferta(Math.toIntExact(idOferta));
                System.out.println(">>> ZONA: Datos ubicacion oferta " + idOferta + ": " + (ubicacion.isEmpty() ? "VACIO" : "OK, filas=" + ubicacion.size()));

                if (!ubicacion.isEmpty()) {
                    Object[] loc = ubicacion.get(0);
                    String tituloOfertaZona = (String) loc[0];
                    String nombreCiudad = (String) loc[1];
                    Integer idCiudad = ((Number) loc[2]).intValue();
                    String nombreProvincia = (String) loc[3];
                    Integer idProvincia = ((Number) loc[4]).intValue(); 

                    System.out.println(">>> ZONA: Oferta '" + tituloOfertaZona + "' en " + nombreCiudad + ", " + nombreProvincia + " (prov=" + idProvincia + ")");

                    List<Object[]> postulantes = usuarioRepository.findPostulantesByProvinciaNativo(idProvincia);
                    System.out.println(">>> ZONA: Postulantes encontrados en provincia " + idProvincia + ": " + postulantes.size());

                    for (Object[] post : postulantes) {
                        try {
                            Long idPostulante = ((Number) post[0]).longValue();
                            String nombrePost = (String) post[1];
                            String apellidoPost = (String) post[2];

                            System.out.println(">>> ZONA: Notificando a " + nombrePost + " " + apellidoPost + " (id=" + idPostulante + ")");

                            Map<String, String> variablesZona = new java.util.HashMap<>();
                            variablesZona.put("nombre", nombrePost + " " + (apellidoPost != null ? apellidoPost : ""));
                            variablesZona.put("titulo", tituloOfertaZona);
                            variablesZona.put("provincia", nombreProvincia);

                            Map<String, Object> datosZona = new java.util.HashMap<>();
                            datosZona.put("idOferta", idOferta);
                            datosZona.put("ciudad", nombreCiudad);
                            datosZona.put("provincia", nombreProvincia);
                            datosZona.put("idCiudad", idCiudad);
                            datosZona.put("idProvincia", idProvincia);

                            notificacionService.crearYEnviarNotificacion(
                                    idPostulante,
                                    "nueva_oferta_zona",
                                    variablesZona,
                                    datosZona,
                                    "/menu-principal/Busqueda/empleo",
                                    "location_on"
                            );
                            System.out.println(">>> ZONA: Notificacion guardada para id=" + idPostulante);
                        } catch (Exception ex) {
                            System.err.println(">>> ZONA ERROR postulante: " + ex.getMessage());
                            ex.printStackTrace();
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println(">>> ZONA ERROR GENERAL: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }





    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Long> contarPostulantesPorOfertas(List<Integer> ids) {
        List<Object[]> resultados = postulacionRepository.contarPorOfertas(ids.toArray(new Integer[0]));
        Map<Integer, Long> mapa = new HashMap<>();
        for (Object[] fila : resultados) {
            mapa.put(((Number) fila[0]).intValue(), ((Number) fila[1]).longValue());
        }
        return mapa;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IOfertaDetallada> listarOfertasCompleto(Long idUsuario) {
        return ofertaRepository.listarOfertasCompleto(idUsuario);
    }

    @Override
    @Transactional
    public String toggleFavorita(Integer idOferta, Long idUsuario) {
        return ofertaRepository.toggleFavorita(idOferta, idUsuario);
    }

    @Override
    public OfertaExtraInfoDTO obtenerExtraInfo(Integer idOferta) {
        try {
            String json = ofertaRepository.obtenerExtraInfoOferta(idOferta);
            return objectMapper.readValue(json, OfertaExtraInfoDTO.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al parsear info extra de oferta: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OfertaLaboral guardarOfertaFisica(OfertaLaboralDTO dto, MultipartFile archivoOficio, Long idUsuarioAdmin) {


        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("el título de la oferta es obligatorio");
        }
        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            throw new IllegalArgumentException("la descripción es obligatoria");
        }
        if (dto.getIdCiudad() == null || dto.getIdCiudad() == 0) {
            throw new IllegalArgumentException("debe seleccionar una provincia y una ciudad válida");
        }
        if (dto.getCantidadVacantes() == null || dto.getCantidadVacantes() < 1) {
            throw new IllegalArgumentException("debe haber al menos 1 vacante");
        }
        if (dto.getSalarioMin() != null && dto.getSalarioMax() != null) {
            if (dto.getSalarioMin().compareTo(dto.getSalarioMax()) > 0) {
                throw new IllegalArgumentException("el salario mínimo no puede ser mayor al salario máximo");
            }
        }
        if (dto.getFechaInicio() != null && dto.getFechaCierre() != null) {
            if (dto.getFechaCierre().isBefore(dto.getFechaInicio())) {
                throw new IllegalArgumentException("la fecha de cierre no puede ser anterior a la fecha de inicio");
            }
        }


        String habilidadesJson = "[]";
        try {
            if (dto.getHabilidades() != null && !dto.getHabilidades().isEmpty()) {
                habilidadesJson = objectMapper.writeValueAsString(dto.getHabilidades());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir habilidades a json", e);
        }

        String requisitosJson = "[]";
        try {
            if (dto.getRequisitos_manuales() != null && !dto.getRequisitos_manuales().isEmpty()) {
                requisitosJson = objectMapper.writeValueAsString(dto.getRequisitos_manuales());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("error al convertir requisitos manuales a json", e);
        }
        try{
            String urlPdf = null;
            if (archivoOficio != null && !archivoOficio.isEmpty()) {
                urlPdf = azureStorageConfig.subirDocumento(archivoOficio);
            }


            if (dto.getIdOferta() == null || dto.getIdOferta() == 0) {
                ofertaRepository.registrarOfertaFisica(
                        dto.getIdEmpresa(),
                        idUsuarioAdmin,
                        dto.getIdModalidad(),
                        dto.getIdCategoria(),
                        dto.getIdJornada(),
                        dto.getIdCiudad(),
                        dto.getTitulo(),
                        dto.getDescripcion(),
                        dto.getSalarioMin(),
                        dto.getSalarioMax(),
                        dto.getCantidadVacantes(),
                        dto.getExperienciaMinima(),
                        dto.getFechaInicio() != null ? dto.getFechaInicio() : java.time.LocalDate.now(),
                        dto.getFechaCierre(),
                        habilidadesJson,
                        requisitosJson,
                        urlPdf
                );

            } else {

                ofertaRepository.actualizarOfertaFisica(
                        dto.getIdOferta(),
                        dto.getIdModalidad(),
                        dto.getIdCategoria(),
                        dto.getIdJornada(),
                        dto.getIdCiudad(),
                        dto.getTitulo(),
                        dto.getDescripcion(),
                        dto.getSalarioMin(),
                        dto.getSalarioMax(),
                        dto.getCantidadVacantes(),
                        dto.getExperienciaMinima(),
                        dto.getEstadoOferta(),
                        dto.getFechaCierre(),
                        habilidadesJson,
                        requisitosJson,
                        urlPdf
                );
            }

            return null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public Long crearEmpresaPorAdmin(NuevaEmpresaAdminDTO dto) {
        String claveEncriptada = passwordEncoder.encode(dto.getContrasenia());
        String descripcionDefecto = "Empresa registrada por ventanilla institucional";

        usuarioEmpresaRepository.registrarEmpresaCompletaDb(
                dto.getCorreo(),
                claveEncriptada,
                dto.getId_ciudad(),
                dto.getNombre_empresa(),
                descripcionDefecto,
                dto.getRuc(),
                dto.getSitio_web()
        );

        usuarioEmpresaRepository.aprobarEmpresaInmediatamente(dto.getCorreo());
        return usuarioEmpresaRepository.obtenerIdEmpresaPorRuc(dto.getRuc());
    }

    @Override
   public List<IOfertaFisicaAdminDTO> listarOfertasFisicasAdmin(){
        return ofertaRepository.listarOfertasFisicasAdmin();
   }
}
