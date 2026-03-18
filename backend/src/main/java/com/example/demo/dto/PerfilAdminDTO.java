package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilAdminDTO {
    private Long   idUsuario;
    private String nombre;
    private String apellido;
    private String correo;           // solo lectura — no se actualiza
    private String telefono;
    private String genero;
    private String fechaNacimiento;  // ✅ String "YYYY-MM-DD" — evita problemas de Jackson/LocalDate
    private String urlImagen;
}