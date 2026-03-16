package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaPostulanteDTO {
    private Long idUsuario;
    private Integer idPerfilAcademico;
    private String nombrePostulante;
    private String correo;
    private LocalDateTime ultimaModificacion;
    private Long totalMovimientos;
}