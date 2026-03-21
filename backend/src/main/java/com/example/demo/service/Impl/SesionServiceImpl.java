package com.example.demo.service.Impl;

import com.example.demo.model.Sesion;
import com.example.demo.repository.SesionRepository;
import com.example.demo.service.ISesionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SesionServiceImpl implements ISesionService {

    @PersistenceContext
    private EntityManager entityManager;
    private final SesionRepository sesionRepository;

    @Override
    @Transactional
    public Long registrarLogin(Integer idSeguridad, String navegador, String dispositivo) {

        // ✅ Ya no pasamos ip — PostgreSQL la captura con inet_client_addr()
        Object result = entityManager.createNativeQuery(
                        "SELECT CAST(seguridad.fn_registrar_sesion(:idSeg, :nav, :disp, 'ACTIVA') AS BIGINT)")
                .setParameter("idSeg", idSeguridad)
                .setParameter("nav",   navegador)
                .setParameter("disp",  dispositivo)
                .getSingleResult();

        if (result != null) {
            return Long.valueOf(result.toString());
        }

        return null;
    }

    @Override
    @Transactional
    public void registrarLogout(Integer idSeguridad) {

        entityManager.createNativeQuery(
                        "SELECT CAST(seguridad.fn_registrar_sesion(:idSeg, NULL, NULL, 'CERRADA') AS BIGINT)")
                .setParameter("idSeg", idSeguridad)
                .getSingleResult();
    }

    @Override
    @Transactional
    public void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta) {
        Sesion sesion = sesionRepository.findById(idSesion)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada con ID: " + idSesion));

        sesion.setAccion("CERRADA");
        sesion.setFechaCierre(LocalDateTime.now());

        sesionRepository.save(sesion);
    }
}