package com.example.demo.repository.Views;

import java.time.LocalDate;

public interface IPostulanteOfertaDTO {
    Long getId_postulacion();
    Long getId_graduado();
    String getNombres();
    String getApellidos();
    String getCorreo();
    String getProfesion();
    LocalDate getFecha_postulacion();
    String getEstado_postulacion();
}
