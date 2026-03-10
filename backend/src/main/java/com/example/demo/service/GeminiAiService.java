package com.example.demo.service;
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

    public JsonNode analizarCvConOferta(String textoCv, String tituloOferta, String descripcionOferta, String requisitosOferta) {
        try {
            // 1. Armamos la instrucción para la IA
            String prompt = String.format(
                    "Eres un ATS (Applicant Tracking System) experto. Evalúa el siguiente CV contra la oferta laboral.\n" +
                            "OFERTA: Título: '%s'. Descripción: '%s'. Requisitos: '%s'.\n" +
                            "TEXTO DEL CV: '%s'.\n" +
                            "Instrucción estricta: Devuelve ÚNICAMENTE un objeto JSON válido sin texto adicional (ni siquiera formato de código markdown). " +
                            "El JSON debe tener exactamente esta estructura:\n" +
                            "{\n" +
                            "  \"cv_valido\": true/false,\n" +
                            "  \"motivo_invalidez\": \"Mensaje corto solo si cv_valido es false (ej. CV vacío o sin experiencia)\",\n" +
                            "  \"match_oferta\": {\n" +
                            "    \"porcentaje\": <número 0-100>,\n" +
                            "    \"puntos_fuertes\": [\"fuerte 1\", \"fuerte 2\"],\n" +
                            "    \"debilidades\": [\"debilidad 1\"]\n" +
                            "  }\n" +
                            "}",
                    tituloOferta, descripcionOferta, requisitosOferta, textoCv
            );

            // 2. Construimos el Body de la petición a Gemini
            // Le forzamos el 'response_mime_type' a application/json
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

            // 3. Enviamos la petición (Concatenamos la URL base con el API KEY)
            String fullUrl = apiUrl + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

            // 4. Extraemos el JSON de la respuesta de Gemini
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String respuestaIaText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            // Retornamos el JSON puro que nos dio la IA
            return objectMapper.readTree(respuestaIaText);
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e){
                // Atrapamos el error 429 específicamente
                throw new RuntimeException("El sistema de Inteligencia Artificial está procesando muchas solicitudes. Por favor, espera 15 segundos e intenta de nuevo.");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al comunicarse con la Inteligencia Artificial.");
        }
    }
}
