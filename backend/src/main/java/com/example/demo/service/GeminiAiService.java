package com.example.demo.service;

import com.example.demo.dto.PerfilProfesionalDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    /**
     * Modelos disponibles con esta API key (gemini-1.5-flash-8b ya no existe en v1beta → 404).
     * Se intentan en orden hasta que uno responda.
     */
    private static final String[] GEMINI_MODELS = {
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash-lite"
    };

    private static final String GEMINI_API_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode analizarCvConOferta(
            String textoCv,
            String tituloOferta,
            String descripcionOferta,
            String requisitosOferta,
            PerfilProfesionalDTO perfilDB
    ) {
        String perfilBaseDatos = construirPerfilTexto(perfilDB);
        String prompt = construirPrompt(textoCv, tituloOferta, descripcionOferta, requisitosOferta, perfilBaseDatos);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                },
                "generationConfig", Map.of(
                        "response_mime_type", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Exception ultimoError = null;
        for (String modelo : GEMINI_MODELS) {
            try {
                return invocarModelo(modelo, entity);
            } catch (HttpClientErrorException.TooManyRequests e) {
                log.warn("Gemini {} — cuota agotada (429), probando siguiente modelo", modelo);
                ultimoError = e;
            } catch (HttpClientErrorException.NotFound e) {
                log.warn("Gemini {} — no disponible (404), probando siguiente modelo", modelo);
                ultimoError = e;
            } catch (RuntimeException e) {
                if (e.getMessage() != null && e.getMessage().contains("cuota")) {
                    ultimoError = e;
                    continue;
                }
                throw e;
            } catch (Exception e) {
                log.error("Error con modelo {}: {}", modelo, e.getMessage());
                ultimoError = e;
            }
        }

        if (ultimoError instanceof HttpClientErrorException.TooManyRequests) {
            throw new RuntimeException(
                    "El sistema de Inteligencia Artificial está procesando muchas solicitudes. "
                            + "Por favor, espera 15 segundos e intenta de nuevo."
            );
        }
        log.error("Todos los modelos Gemini fallaron", ultimoError);
        throw new RuntimeException(
                "Error al comunicarse con la Inteligencia Artificial. "
                        + "Verifica que la API key de Gemini esté activa en Google AI Studio."
        );
    }

    private JsonNode invocarModelo(String modelo, HttpEntity<Map<String, Object>> entity) throws Exception {
        String url = GEMINI_API_BASE + modelo + ":generateContent?key=" + geminiApiKey;
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode candidates = rootNode.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            String motivo = rootNode.path("promptFeedback").path("blockReason").asText("sin candidatos");
            throw new RuntimeException("La IA no generó respuesta (" + motivo + ").");
        }

        String respuestaIaText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        if (respuestaIaText == null || respuestaIaText.isBlank()) {
            throw new RuntimeException("La IA devolvió una respuesta vacía.");
        }

        log.info("Análisis CV completado con modelo {}", modelo);
        return objectMapper.readTree(respuestaIaText);
    }

    private static String construirPerfilTexto(PerfilProfesionalDTO perfilDB) {
        if (perfilDB == null) {
            return "Sin perfil profesional registrado en el sistema.";
        }
        return String.format(
                "Candidato: %s %s. Formación: %s. Experiencia: %s. Cursos: %s. Idiomas: %s.",
                nvl(perfilDB.getNombre()), nvl(perfilDB.getApellido()),
                nvl(perfilDB.getFormacionAcademica()), nvl(perfilDB.getExperienciaLaboral()),
                nvl(perfilDB.getCursosRealizados()), nvl(perfilDB.getIdiomas())
        );
    }

    private static String nvl(String v) {
        return v != null && !v.isBlank() ? v : "No registrado";
    }

    private static String construirPrompt(
            String textoCv, String tituloOferta, String descripcionOferta,
            String requisitosOferta, String perfilBaseDatos
    ) {
        return "Eres un reclutador experto (ATS). Tienes dos tareas obligatorias:\n\n"
                + "TAREA 1: Validar el documento PDF.\n"
                + "Analiza el siguiente texto extraído de un PDF subido por el usuario:\n"
                + "\"\"\"" + textoCv + "\"\"\"\n"
                + "¿Este texto tiene la estructura lógica de un Currículum Vitae (contiene información personal, educación, experiencia)? "
                + "Si es un documento falso, una transcripción, o no tiene formato de CV, marca cv_valido como false y explica el motivo.\n\n"
                + "TAREA 2: Evaluar al candidato.\n"
                + "Si el CV es válido, IGNORA el texto del PDF para la evaluación. Usa ÚNICAMENTE esta información certificada de nuestra base de datos:\n"
                + "\"\"\"" + perfilBaseDatos + "\"\"\"\n"
                + "Compara ese perfil de la base de datos con esta Oferta Laboral (" + tituloOferta + " - " + descripcionOferta + "):\n"
                + "Requisitos de la oferta: " + requisitosOferta + "\n\n"
                + "Instrucción estricta: Devuelve ÚNICAMENTE un objeto JSON válido sin texto adicional. El JSON debe tener exactamente esta estructura:\n"
                + "{\n"
                + "  \"cv_valido\": true/false,\n"
                + "  \"motivo_invalidez\": \"Explicación si es false (máximo 2 líneas), si es true pon null\",\n"
                + "  \"match_oferta\": {\n"
                + "    \"porcentaje\": <número 0-100>,\n"
                + "    \"puntos_fuertes\": [\"fuerte 1\", \"fuerte 2\"],\n"
                + "    \"puntos_debiles\": [\"debilidad 1\"]\n"
                + "  }\n"
                + "}";
    }
}
