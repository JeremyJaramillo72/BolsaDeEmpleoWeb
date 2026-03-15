package com.example.demo.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class JSearchResponseDTO {
    private String status;
    private String requestId;
    private Integer page;
    private Integer numPages;
    private String query;
    private String country;
    private String datePosted;
    private String language;
    private List<JSearchOfertaDTO> data = new ArrayList<>();
}

