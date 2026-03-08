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

    // 🔥 EL NUEVO MÉTODO DE LA MUERTE
    @Override
    @Transactional
    public void actualizarEstadoCuentaYSesion(Long idSesion, String estadoCuenta) {
        // 1. Buscamos la sesión actual usando JPA
        Sesion sesion = sesionRepository.findById(idSesion)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada con ID: " + idSesion));

        // 2. Si el admin mandó a "Inactivo" (Dar de baja), pateamos la sesión
        if ("Inactivo".equalsIgnoreCase(estadoCuenta)) {
            sesion.setAccion("CERRADA");
            sesion.setFechaCierre(LocalDateTime.now());
            sesionRepository.save(sesion);
        }

        // 3. ¡EL GOLPE FINAL! Actualizamos la cuenta del usuario
        // Usamos una subconsulta para llegar desde seguridad.sesiones hasta usuarios.usuario
        String sqlUpdateUser = "UPDATE usuarios.usuario SET estado_validacion = :estado " +
                "WHERE id_usuario = (SELECT id_usuario FROM seguridad.seguridad WHERE id_seguridad = :idSeg)";

        entityManager.createNativeQuery(sqlUpdateUser)
                .setParameter("estado", estadoCuenta)
                .setParameter("idSeg", sesion.getIdSeguridad())
                .executeUpdate();
    }
}