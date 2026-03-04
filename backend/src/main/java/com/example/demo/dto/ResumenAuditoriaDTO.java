package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenAuditoriaDTO {
    private Integer totalAcciones;
    private LocalDateTime ultimoAcceso;
    private Integer totalInsert;
    private Integer totalUpdate;
    private Integer totalDelete;
}