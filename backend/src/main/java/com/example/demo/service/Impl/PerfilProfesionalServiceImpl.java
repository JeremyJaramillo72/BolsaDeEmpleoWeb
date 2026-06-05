package com.example.demo.service.Impl;

import com.example.demo.dto.PerfilProfesionalDTO;
import com.example.demo.repository.Impl.PerfilProfesionalRepository;
import com.example.demo.repository.PerfilAcademicoRepository;
import com.example.demo.service.AzureStorageConfig;
import com.example.demo.service.IPerfilProfesionalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PerfilProfesionalServiceImpl implements IPerfilProfesionalService {

    private static final Logger log = LoggerFactory.getLogger(PerfilProfesionalServiceImpl.class);

    private final PerfilProfesionalRepository perfilProfesionalRepository;
    private final ObjectMapper objectMapper;
    private final AzureStorageConfig azureStorageConfig;
    private final PerfilAcademicoRepository perfilAcademicoRepository;




@Override
    public PerfilProfesionalDTO obtenerPerfil(Long idUsuario) {
        return perfilProfesionalRepository.obtenerPerfilCompleto(idUsuario);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public String procesarYRegistrar(Long idUsuario, String tipoItem, Map<String, Object> datos, MultipartFile archivo) {

        String jsonDatos;

        try {
            jsonDatos = objectMapper.writeValueAsString(datos);
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar los datos del formulario.", e);
        }

        String urlArchivo = null;
        String advertenciaArchivo = null;

        if (archivo != null && !archivo.isEmpty()) {
            try {
                urlArchivo = azureStorageConfig.subirDocumento(archivo);
            } catch (Exception e) {
                log.warn("No se pudo subir el archivo a Azure para usuario {} ({}): {}",
                        idUsuario, tipoItem, e.getMessage());
                advertenciaArchivo =
                        "Los datos se guardaron, pero el PDF no se pudo subir a la nube. "
                                + "Vuelve a intentarlo más tarde o guarda sin adjunto.";
            }
        }

        perfilProfesionalRepository.registrarItemPerfil(idUsuario, tipoItem, jsonDatos, urlArchivo);
        return advertenciaArchivo;
    }

    @Override
    @Transactional
    public void actualizarDatosPersonales(Long idUsuario, String nombre, String apellido, String fechaNacimientoStr, String genero, String telefono, Integer idCiudad) {


        LocalDate fechaNac = null;
        if (fechaNacimientoStr != null && !fechaNacimientoStr.trim().isEmpty()) {
            fechaNac = LocalDate.parse(fechaNacimientoStr);
        }
        perfilAcademicoRepository.actualizarDatosPersonalesPro(
                idUsuario,
                nombre,
                apellido,
                fechaNac,
                genero,
                telefono,
                idCiudad
        );
    }
    @Transactional
    @Override
    public void eliminarItem(Long idUsuario, String tipoItem, Integer idItem) {
        try {
            perfilProfesionalRepository.eliminarItemPerfil(idUsuario, tipoItem, idItem);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Transactional
    @Override
    public Integer RegistrarCatalogoEmpresa(String nombreEmpresa,String ruc,Integer idcategoria)
    {
        try {
          return  perfilProfesionalRepository.crearEmpresa(nombreEmpresa,ruc,idcategoria);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    @Override
    public Integer RegistrarCargo(String cargo){
    try {
        return perfilProfesionalRepository.crearCargo(cargo);

    } catch (Exception e) {
        throw new RuntimeException(e);
    }
    }


}
