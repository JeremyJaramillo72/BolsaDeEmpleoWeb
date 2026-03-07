package com.example.demo.service.Impl;

import com.example.demo.dto.ActualizarCursosDTO;
import com.example.demo.repository.CursosRepository;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.ICursosServices;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CursosServicesImpl implements ICursosServices {
    private final AzureStorageConfig azureStorageConfig;
    private final CursosRepository cursosRepository;

    @Override
    @Transactional
    public void modificarCursos(ActualizarCursosDTO dto){
        String urlarchivo =null;
        try{
            if (dto.getArchivo()!=null && !dto.getArchivo().isEmpty()){
                urlarchivo= azureStorageConfig.subirDocumento(dto.getArchivo());
            }
            cursosRepository.actualizarCurso(
                    dto.getIdCurso(),
                    dto.getNombreCurso(),
                    dto.getInstitucion(),
                    dto.getHorasDuracion(),
                    urlarchivo
            );

        } catch (Exception e) {
            throw new RuntimeException("Error en la transaccion al modifcar el curso" + e);
        }

    }
}
