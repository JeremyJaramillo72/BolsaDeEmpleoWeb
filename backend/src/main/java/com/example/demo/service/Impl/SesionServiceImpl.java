package com.example.demo.service.Impl;

import com.example.demo.service.ISesionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SesionServiceImpl implements ISesionService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void registrarLogin(Integer idSeguridad, String ip, String navegador, String dispositivo) {
        entityManager.createNativeQuery(
                        "SELECT seguridad.fn_registrar_sesion(:idSeg, :ip, :nav, :disp, 'ACTIVA')")
                .setParameter("idSeg", idSeguridad)
                .setParameter("ip",    ip)
                .setParameter("nav",   navegador)
                .setParameter("disp",  dispositivo)
                .getSingleResult();
    }

    @Override
    @Transactional
    public void registrarLogout(Integer idSeguridad) {
        entityManager.createNativeQuery(
                        "SELECT seguridad.fn_registrar_sesion(:idSeg, NULL, NULL, NULL, 'CERRADA')")
                .setParameter("idSeg", idSeguridad)
                .getSingleResult();
    }
}