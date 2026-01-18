package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    // Reemplaza a 'const codigosTemporales = {}'
    private final ConcurrentHashMap<String, String> codigosTemporales = new ConcurrentHashMap<>();

    public void guardarCodigo(String correo, String codigo) {
        codigosTemporales.put(correo, codigo);
    }

    public boolean validarCodigo(String correo, String codigoIngresado) {
        String codigoGuardado = codigosTemporales.get(correo);
        return codigoGuardado != null && codigoGuardado.equals(codigoIngresado);
    }

    public void borrarCodigo(String correo) {
        codigosTemporales.remove(correo);
    }
}