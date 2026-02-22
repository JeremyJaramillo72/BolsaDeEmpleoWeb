package com.example.demo.service;

import java.time.LocalDate;

public interface IPerfilAcademicoService {
    /**
     * Registra un nuevo título académico ejecutando el procedimiento almacenado.
     * @param idUsuario ID del usuario logueado.
     * @param idCarrera ID de la carrera seleccionada en el combo.
     * @param fecha Fecha de graduación ingresada.
     * @param senescyt Número de registro SENESCYT.
     * @param urlArchivo URL del archivo subido a Cloudinary.
     */
    void registrarNuevoTitulo(Long idUsuario, Integer idCarrera, LocalDate fecha, String senescyt, String urlArchivo);
}