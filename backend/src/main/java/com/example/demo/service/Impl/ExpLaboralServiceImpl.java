package com.example.demo.service.Impl;

import com.example.demo.dto.ActualizarExperienciaLaboralDTO;
import com.example.demo.repository.ExpLaboralRepository;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IExpLaboralService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
@RequiredArgsConstructor
@Service
public class ExpLaboralServiceImpl implements IExpLaboralService {
    private  final ExpLaboralRepository expLaboralRepository;
    private  final CloudinaryService cloudinaryService;
    private final AzureStorageConfig azureStorageConfig;

    @Override
    @Transactional
    public void registrarExpLaboral(Long idUsuario, Integer idCargo, Integer idEmpresaCatalogo,
                                     LocalDate fechaInicio, LocalDate fechaFin,
                                     String descripcion, String ubicacion, MultipartFile archivo) {
        try {
            String urlComprobante = null;
            if (archivo != null && !archivo.isEmpty()) {
                urlComprobante = cloudinaryService.subirImagenEArchivo(archivo);
            }

            expLaboralRepository.registrarExpLaboralPro(
                    idUsuario,
                    idCargo,
                    idEmpresaCatalogo,
                    fechaInicio,
                    fechaFin,
                    descripcion,
                    ubicacion,
                    urlComprobante
            );
        } catch (Exception e) {
            throw new RuntimeException("Error al registrar experiencia laboral: " + e.getMessage());
        }
    }
    @Override
    @Transactional
    public void actualizarExpLaboral(ActualizarExperienciaLaboralDTO dto){
        try{
            String urlArchivo =null;
            if (dto.getArchivo() !=null && !dto.getArchivo().isEmpty()){
                 urlArchivo = azureStorageConfig.subirDocumento(dto.getArchivo());

            }
            String cargosJson = dto.getCargosIds().toString();
            expLaboralRepository.ActualizarExpLaboral(
                    dto.getIdExpLaboral(),
                    dto.getIdEmpresaCatalogo(),
                    LocalDate.parse(dto.getFechaInicio()),
                    dto.getFechaFin() != null && !dto.getFechaFin().isEmpty() ? LocalDate.parse(dto.getFechaFin()) : null,
                    dto.getDescripcion(),
                    dto.getIdCiudad(),
                    urlArchivo,
                   cargosJson
            );

        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }
}

