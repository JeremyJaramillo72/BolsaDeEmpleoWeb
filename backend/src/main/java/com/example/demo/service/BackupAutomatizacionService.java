package com.example.demo.service;

import com.example.demo.model.ConfiguracionBackup;
import com.example.demo.model.HistorialBackup;
import com.example.demo.repository.ConfiguracionBackupRepository;
import com.example.demo.repository.HistorialBackupRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@RequiredArgsConstructor
@Service
public class BackupAutomatizacionService {

    private final UsuarioRepository usuarioRepo;
    private final ConfiguracionBackupRepository configRepo;
    private final HistorialBackupRepository historialRepo;
    private final DatabaseBackupService respaldosDbService;

    public ConfiguracionBackup obtenerConfiguracion() {
        return configRepo.findById(1L).orElse(new ConfiguracionBackup());
    }

    public ConfiguracionBackup guardarConfiguracion(ConfiguracionBackup nuevaConfig) {
        ConfiguracionBackup configExistente = obtenerConfiguracion();
        configExistente.setHabilitado(nuevaConfig.getHabilitado());
        configExistente.setHoraEjecucion(nuevaConfig.getHoraEjecucion());
        configExistente.setDiasSemana(nuevaConfig.getDiasSemana());
        configExistente.setTipoFrecuencia(nuevaConfig.getTipoFrecuencia());
        configExistente.setIntervalo(nuevaConfig.getIntervalo());

        return configRepo.save(configExistente);
    }

    public List<HistorialBackup> obtenerHistorial() {
        return historialRepo.findAll();
    }

    public void registrarAuditoria(String tipo, String estado, Long tamano, String error,Long idUsuario) {
        registrarAuditoria(tipo, estado, tamano, error, null,idUsuario);
    }


    public void registrarAuditoria(String tipo, String estado, Long tamano, String error, String urlAzure,Long idUsuario) {
        HistorialBackup historial = new HistorialBackup();
        historial.setTipo(tipo);
        historial.setEstado(estado);
        historial.setTamanoBytes(tamano);
        historial.setMensajeError(error);
        if (idUsuario != null) {
            usuarioRepo.findById(idUsuario).ifPresent(usuario -> {
                historial.setUsuarioEjecutor(usuario);
            });
        }


        historial.setFechaEjecucion(LocalDateTime.now(ZoneId.of("America/Guayaquil")));

        if (urlAzure != null) {
            historial.setUrlAzure(urlAzure);
        }

        historialRepo.save(historial);
    }

    @Scheduled(cron = "0 * * * * ?")
    public void revisarYEjecutarBackupAutomatico() {
        ConfiguracionBackup config = obtenerConfiguracion();


        if (config.getHabilitado() == null || !config.getHabilitado()) {
            return;
        }

        LocalDateTime ahora = LocalDateTime.now(ZoneId.of("America/Guayaquil"));
        LocalTime horaActual = ahora.toLocalTime();


        HistorialBackup ultimoBackup = historialRepo.findFirstByTipoOrderByIdBackupDesc("AUTOMATICO");
        LocalDateTime fechaUltimo = (ultimoBackup != null && ultimoBackup.getFechaEjecucion() != null)
                ? ultimoBackup.getFechaEjecucion()
                : LocalDateTime.MIN;

        String tipoFreq = config.getTipoFrecuencia() != null ? config.getTipoFrecuencia() : "SEMANAL";
        boolean ejecutarAhora = false;

        switch (tipoFreq) {
            case "SEMANAL":
                if (config.getHoraEjecucion() != null &&
                        horaActual.getHour() == config.getHoraEjecucion().getHour() &&
                        horaActual.getMinute() == config.getHoraEjecucion().getMinute()) {
                    ejecutarAhora = esDiaPermitido(ahora, config.getDiasSemana());
                }
                break;

            case "HORAS":
                if (config.getIntervalo() != null && config.getIntervalo() > 0) {
                    if (ahora.isAfter(fechaUltimo.plusHours(config.getIntervalo()))) {
                        ejecutarAhora = true;
                    }
                }
                break;

            case "DIAS":
                if (config.getIntervalo() != null && config.getIntervalo() > 0) {
                    if (ahora.toLocalDate().isAfter(fechaUltimo.toLocalDate().plusDays(config.getIntervalo() - 1))) {
                        if (config.getHoraEjecucion() != null &&
                                horaActual.getHour() == config.getHoraEjecucion().getHour() &&
                                horaActual.getMinute() == config.getHoraEjecucion().getMinute()) {
                            ejecutarAhora = true;
                        }
                    }
                }
                break;

            case "MINUTOS":
                if (config.getIntervalo() != null && config.getIntervalo() > 0) {
                    if (ahora.isAfter(fechaUltimo.plusMinutes(config.getIntervalo()))) {
                        ejecutarAhora = true;
                    }
                }
                break;
        }

        if (ejecutarAhora) {
            System.out.println("⏰ ¡ES LA HORA! Iniciando Backup Automático (" + tipoFreq + ")...");
            ejecutarProcesoBackup("AUTOMATICO",9L);
        }
    }

    private boolean esDiaPermitido(LocalDateTime ahora, String diasSemanaConfigurados) {
        if (diasSemanaConfigurados == null || diasSemanaConfigurados.isEmpty()) return false;
        String diaActual = ahora.getDayOfWeek().getDisplayName(TextStyle.FULL, new Locale("es", "ES")).toLowerCase();

        String inicialHoy = "";
        switch (diaActual) {
            case "lunes": inicialHoy = "Lu"; break;
            case "martes": inicialHoy = "Ma"; break;
            case "miércoles": case "miercoles": inicialHoy = "Mi"; break;
            case "jueves": inicialHoy = "Ju"; break;
            case "viernes": inicialHoy = "Vi"; break;
            case "sábado": case "sabado": inicialHoy = "Sá"; break;
            case "domingo": inicialHoy = "Do"; break;
        }

        return diasSemanaConfigurados.contains(inicialHoy);
    }

    public void ejecutarProcesoBackup(String tipoBackup,Long idUsuario) {
        try {

            DatabaseBackupService.BackupResult resultado = respaldosDbService.generarBackupYSubirAzure();

            File archivoZip = resultado.getArchivoLocal();
            String urlAzure = resultado.getUrlAzure();

            registrarAuditoria(tipoBackup, "EXITO", archivoZip.length(), null, urlAzure, idUsuario);            System.out.println("✅ Backup " + tipoBackup + " finalizado. Archivo: " + archivoZip.getName());

        } catch (Exception e) {

            registrarAuditoria(tipoBackup, "ERROR", 0L, e.getMessage(), null, idUsuario);
            System.err.println("❌ Error en Backup " + tipoBackup + ": " + e.getMessage());
        }
    }
}