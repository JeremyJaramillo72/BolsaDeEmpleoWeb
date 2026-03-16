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
        // Ejecutamos la función y capturamos el resultado (el ID generado)
        // Nota: Usamos una consulta que retorne el valor, por ejemplo llamando a la función con SELECT
        Object result = entityManager.createNativeQuery(
                        "SELECT seguridad.fn_registrar_sesion(:idSeg, :ip, :nav, :disp, 'ACTIVA')")
                .setParameter("idSeg", idSeguridad)
                .setParameter("ip",    ip)
                .setParameter("nav",   navegador)
                .setParameter("disp",  dispositivo)
                .getSingleResult();

        return ((Number) result).longValue();
    }

    @Override
    @Transactional
    public void registrarLogout(Integer idSeguridad) {
        entityManager.createNativeQuery(
                        "SELECT seguridad.fn_registrar_sesion(:idSeg, NULL, NULL, NULL, 'CERRADA')")
                .setParameter("idSeg", idSeguridad)
                .getSingleResult();
    }

    // 🔥 EL NUEVO MÉTODO DE LA MUERTE
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