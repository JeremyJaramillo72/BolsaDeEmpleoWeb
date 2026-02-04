package com.example.demo.service.Impl;

import com.example.demo.dto.UsuarioEmpresaDTO;
import com.example.demo.model.UsuarioEmpresa;
import com.example.demo.repository.UsuarioEmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.IUsuarioEmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioEmpresaServiceImpl implements IUsuarioEmpresaService {

    private final UsuarioEmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public UsuarioEmpresaDTO guardar(UsuarioEmpresaDTO usuarioEmpresaDTO) {
        return null;
    }
    @Transactional
    @Override
    public  UsuarioEmpresaDTO editar(Long id, UsuarioEmpresaDTO dto ){
      empresaRepository.actualizarDatosEmpresa(
              id, dto.getNombre(), dto.getSitioWeb(), dto.getDescripcion()
      );
      dto.setIdEmpresa(id);
      return dto;
    }

    public UsuarioEmpresa ObtenerIdEmpresa (Long id){
     return  null;
    }
    @Override
    public UsuarioEmpresaDTO ObtenerIdUsuario(Long idUsuario) {
        UsuarioEmpresa empresa = empresaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada para el usuario: " + idUsuario));

        return mapToDTO(empresa);
    }


    public List<UsuarioEmpresaDTO> ObtenerTodo(){
        return  null;
    }


    private UsuarioEmpresaDTO mapToDTO(UsuarioEmpresa entity) {
        UsuarioEmpresaDTO dto = new UsuarioEmpresaDTO();
        dto.setIdEmpresa(entity.getIdEmpresa());

        if(entity.getUsuario() != null) {
            dto.setIdUsuario(entity.getUsuario().getIdUsuario());
            dto.setNombre(entity.getUsuario().getNombre());
        }

        dto.setDescripcion(entity.getDescripcion());
        dto.setRuc(entity.getRuc());
        dto.setSitioWeb(entity.getSitioWeb());
        dto.setFechaRegistro(entity.getFechaRegistro());
        return dto;
    }


}
