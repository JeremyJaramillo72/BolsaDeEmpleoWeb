package com.example.demo.service;

import com.example.demo.dto.JSearchOfertaDTO;
import com.example.demo.dto.JSearchResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JSearchRapidApiService {

    @Value("${rapidapi.jsearch.base-url:https://jsearch.p.rapidapi.com}")
    private String baseUrl;

    @Value("${rapidapi.jsearch.host:jsearch.p.rapidapi.com}")
    private String rapidApiHost;

    @Value("${rapidapi.jsearch.key:}")
    private String rapidApiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public JSearchResponseDTO buscarOfertas(
            String query,
            Integer page,
            String country,
            String datePosted,
            String language,
            Boolean workFromHome
    ) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("El parametro query es obligatorio");
        }
        if (rapidApiKey == null || rapidApiKey.isBlank()) {
            throw new IllegalStateException("No se encontro rapidapi.jsearch.key. Configure RAPIDAPI_KEY en variables de entorno");
        }

        int pagina = page == null ? 1 : Math.max(1, Math.min(3, page));
        String pais = (country == null || country.isBlank()) ? "us" : country.trim().toLowerCase();
        String fecha = (datePosted == null || datePosted.isBlank()) ? "all" : datePosted.trim().toLowerCase();

        StringBuilder url = new StringBuilder(baseUrl)
                .append("/search?query=").append(encode(query.trim()))
                .append("&page=").append(pagina)
                .append("&num_pages=1")
                .append("&country=").append(encode(pais))
                .append("&date_posted=").append(encode(fecha));

        if (language != null && !language.isBlank()) {
            url.append("&language=").append(encode(language.trim().toLowerCase()));
        }
        if (Boolean.TRUE.equals(workFromHome)) {
            url.append("&work_from_home=true");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url.toString()))
                    .header("x-rapidapi-key", rapidApiKey)
                    .header("x-rapidapi-host", rapidApiHost)
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Respuesta no valida de JSearch: HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JSearchResponseDTO dto = new JSearchResponseDTO();
            dto.setStatus(textOrEmpty(root, "status"));
            dto.setRequestId(textOrEmpty(root, "request_id"));
            dto.setPage(pagina);
            dto.setNumPages(1);
            dto.setQuery(query.trim());
            dto.setCountry(pais);
            dto.setDatePosted(fecha);
            dto.setLanguage(language);

            List<JSearchOfertaDTO> ofertas = new ArrayList<>();
            JsonNode dataNode = root.path("data");
            if (dataNode.isArray()) {
                for (JsonNode item : dataNode) {
                    JSearchOfertaDTO oferta = new JSearchOfertaDTO();
                    oferta.setJobId(textOrEmpty(item, "job_id"));
                    oferta.setJobTitle(textOrEmpty(item, "job_title"));
                    oferta.setEmployerName(textOrEmpty(item, "employer_name"));
                    oferta.setJobEmploymentType(textOrEmpty(item, "job_employment_type"));
                    oferta.setJobCity(textOrEmpty(item, "job_city"));
                    oferta.setJobState(textOrEmpty(item, "job_state"));
                    oferta.setJobCountry(textOrEmpty(item, "job_country"));
                    oferta.setJobDescription(textOrEmpty(item, "job_description"));
                    oferta.setJobPostedAt(textOrEmpty(item, "job_posted_at_datetime_utc"));
                    oferta.setJobApplyLink(textOrEmpty(item, "job_apply_link"));
                    oferta.setJobGoogleLink(textOrEmpty(item, "job_google_link"));
                    oferta.setJobIsRemote(item.path("job_is_remote").asBoolean(false));
                    ofertas.add(oferta);
                }
            }
            dto.setData(ofertas);
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Error consultando JSearch: " + e.getMessage(), e);
        }
    }

    private String textOrEmpty(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

