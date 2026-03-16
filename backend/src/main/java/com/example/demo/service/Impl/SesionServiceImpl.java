package com.example.demo.service.Impl;

import com.example.demo.model.Sesion; // Verifica que sea tu paquete correcto (.entity o .model)
import com.example.demo.repository.SesionRepository;
import com.example.demo.service.ISesionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SesionServiceImpl implements ISesionService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private SesionRepository sesionRepository;

    @Override
    @Transactional
    public Long registrarLogin(Integer idSeguridad, String ip, String navegador, String dispositivo) {

        // 1. Usamos CAST(... AS BIGINT) porque actualizamos la BD para que retorne bigint
        Object result = entityManager.createNativeQuery(
                        "SELECT CAST(seguridad.fn_registrar_sesion(:idSeg, :ip, :nav, :disp, 'ACTIVA') AS BIGINT)")
                .setParameter("idSeg", idSeguridad)
                .setParameter("ip",    ip)
                .setParameter("nav",   navegador)
                .setParameter("disp",  dispositivo)
                .getSingleResult(); // <-- Volvemos a usar getSingleResult()

        // 2. Convertimos el resultado de forma segura
        if (result != null) {
            return Long.valueOf(result.toString());
        }

        return null;
    }

    @Override
    @Transactional
    public void registrarLogout(Integer idSeguridad) {

        // Cambiamos el AS INTEGER por AS BIGINT para que coincida con la nueva función
        entityManager.createNativeQuery(
                        "SELECT CAST(seguridad.fn_registrar_sesion(:idSeg, NULL, NULL, NULL, 'CERRADA') AS BIGINT)")
                .setParameter("idSeg", idSeguridad)
                .getSingleResult();
    }
    @Override
    @Transactional
    public void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta) {
        // 1. Buscamos la sesión específica por su ID
        Sesion sesion = sesionRepository.findById(idSesion)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada con ID: " + idSesion));

        // 2. Solo actualizamos la tabla seguridad.sesiones
        // Cambiamos el estado a CERRADA y marcamos la hora exacta del cierre forzado
        sesion.setAccion("CERRADA");
        sesion.setFechaCierre(LocalDateTime.now());

        sesionRepository.save(sesion);
        // Al no haber código de update a usuarios.usuario, la cuenta permanece intacta.
    }
}