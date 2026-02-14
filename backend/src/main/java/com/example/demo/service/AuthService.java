package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static class CodigoTemporal {
        String codigo;
        long expiracion;

        CodigoTemporal(String codigo, long expiracion) {
            this.codigo = codigo;
            this.expiracion = expiracion;
        }
    }

    private final ConcurrentHashMap<String, CodigoTemporal> codigos = new ConcurrentHashMap<>();

    // 5 minutos
    private static final long TIEMPO_EXPIRACION = 5 * 60 * 1000;

    public void guardarCodigo(String correo, String codigo) {
        long expiraEn = System.currentTimeMillis() + TIEMPO_EXPIRACION;
        codigos.put(correo, new CodigoTemporal(codigo, expiraEn));
    }

    public boolean validarCodigo(String correo, String codigoIngresado) {
        CodigoTemporal data = codigos.get(correo);

        if (data == null) return false;

        if (System.currentTimeMillis() > data.expiracion) {
            codigos.remove(correo); // expiro
            return false;
        }

        return data.codigo.equals(codigoIngresado);
    }

    public void borrarCodigo(String correo) {
        codigos.remove(correo);
    }
}
