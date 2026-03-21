package com.example.demo.service;

import com.example.demo.dto.PerfilProfesionalDTO; // <-- Asegúrate de tener este import
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeminiAiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode analizarCvConOferta(
            String textoCv,
            String tituloOferta,
            String descripcionOferta,
            String requisitosOferta,
            PerfilProfesionalDTO perfilDB
    ) {
        try {
            String perfilBaseDatos = String.format(
                    "Candidato: %s %s. Formación: %s. Experiencia: %s. Cursos: %s. Idiomas: %s.",
                    perfilDB.getNombre(), perfilDB.getApellido(),
                    perfilDB.getFormacionAcademica(), perfilDB.getExperienciaLaboral(),
                    perfilDB.getCursosRealizados(), perfilDB.getIdiomas()
            );

            String prompt = "Eres un reclutador experto (ATS). Tienes dos tareas obligatorias:\n\n" +
                    "TAREA 1: Validar el documento PDF.\n" +
                    "Analiza el siguiente texto extraído de un PDF subido por el usuario:\n" +
                    "\"\"\"" + textoCv + "\"\"\"\n" +
                    "¿Este texto tiene la estructura lógica de un Currículum Vitae (contiene información personal, educación, experiencia)? Si es un documento falso, una transcripción, o no tiene formato de CV, marca cv_valido como false y explica el motivo.\n\n" +
                    "TAREA 2: Evaluar al candidato.\n" +
                    "Si el CV es válido, IGNORA el texto del PDF para la evaluación. Usa ÚNICAMENTE esta información certificada de nuestra base de datos:\n" +
                    "\"\"\"" + perfilBaseDatos + "\"\"\"\n" +
                    "Compara ese perfil de la base de datos con esta Oferta Laboral (" + tituloOferta + " - " + descripcionOferta + "):\n" +
                    "Requisitos de la oferta: " + requisitosOferta + "\n\n" +
                    "Instrucción estricta: Devuelve ÚNICAMENTE un objeto JSON válido sin texto adicional. El JSON debe tener exactamente esta estructura:\n" +
                    "{\n" +
                    "  \"cv_valido\": true/false,\n" +
                    "  \"motivo_invalidez\": \"Explicación si es false (máximo 2 líneas), si es true pon null\",\n" +
                    "  \"match_oferta\": {\n" +
                    "    \"porcentaje\": <número 0-100>,\n" +
                    "    \"puntos_fuertes\": [\"fuerte 1\", \"fuerte 2\"],\n" +
                    "    \"puntos_debiles\": [\"debilidad 1\"]\n" +
                    "  }\n" +
                    "}";

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

            String fullUrl = apiUrl + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String respuestaIaText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            return objectMapper.readTree(respuestaIaText);

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e){
            throw new RuntimeException("El sistema de Inteligencia Artificial está procesando muchas solicitudes. Por favor, espera 15 segundos e intenta de nuevo.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al comunicarse con la Inteligencia Artificial.");
        }
    }
}