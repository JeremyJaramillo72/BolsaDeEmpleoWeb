package com.example.demo.service.Impl;

import com.example.demo.repository.OfertaLaboralRepository; // 👈 Tu repositorio
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
public class OfertaLaboralServiceImpl {

    @Autowired
    private OfertaLaboralRepository repository;

    @Transactional // 🛡️ Obligatorio para invocar procedures con OUT/INOUT
    public Map<String, String> verMejorOferta(Integer idEmpresa) {
        // Llamada al repo usando el nombre correcto
        Map<String, Object> resultado = repository.obtenerOfertaMayorSalario(idEmpresa);

        Map<String, String> respuesta = new HashMap<>();

        // Verificamos que el resultado no sea nulo para evitar el NullPointerException
        if (resultado != null) {
            respuesta.put("nombre", String.valueOf(resultado.get("p_oferta_nombre")));
            respuesta.put("detalles", String.valueOf(resultado.get("p_detalles")));
        } else {
            respuesta.put("error", "No se encontraron ofertas para esta empresa");
        }
        return respuesta;
    }
}