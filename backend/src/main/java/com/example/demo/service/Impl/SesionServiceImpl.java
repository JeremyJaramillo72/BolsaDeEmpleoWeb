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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SesionServiceImpl implements ISesionService {

    @PersistenceContext
    private EntityManager entityManager;
    private final SesionRepository sesionRepository;

    private String extractBrowser(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Desconocido";
        }
        String[] browsers = {"Edg", "OPR", "Chrome", "Firefox", "Safari"};
        for (String browser : browsers) {
            Pattern pattern = Pattern.compile(browser + "/[0-9.]+");
            Matcher matcher = pattern.matcher(userAgent);
            if (matcher.find()) {
                String result = matcher.group();
                if (result.startsWith("Edg/")) {
                    return result.replace("Edg", "Edge");
                }
                if (result.startsWith("OPR/")) {
                    return result.replace("OPR", "Opera");
                }
                return result;
            }
        }
        return "Otro";
    }

    @Override
    @Transactional
    public Long registrarLogin(Integer idSeguridad, String userAgent, String dispositivo) {

        // ✅ Extraemos el navegador real antes de guardar
        String navegador = extractBrowser(userAgent);

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