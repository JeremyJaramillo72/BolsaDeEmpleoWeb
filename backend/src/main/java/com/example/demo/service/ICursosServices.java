package com.example.demo.service;

import com.example.demo.dto.ActualizarCursosDTO;
import org.springframework.stereotype.Service;

@Service
public interface ICursosServices {

     void modificarCursos(ActualizarCursosDTO dto);
}
