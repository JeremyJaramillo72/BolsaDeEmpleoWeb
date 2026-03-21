package com.example.demo.service;

import com.example.demo.dto.ResumenBackupDTO;
import com.example.demo.dto.DetalleBackupDTO;
import java.util.List;
import java.util.Map;

public interface AuditoriaBackupService {
    List<ResumenBackupDTO> obtenerResumen(Map<String, Object> parametros);
    List<DetalleBackupDTO> obtenerDetalle(Map<String, Object> parametros);
}