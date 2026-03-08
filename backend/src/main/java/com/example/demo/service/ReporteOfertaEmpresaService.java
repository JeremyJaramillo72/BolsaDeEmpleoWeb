package com.example.demo.service;

import com.example.demo.dto.FiltroReporteOfertaEmpresaDTO;
import com.example.demo.dto.ReporteOfertaEmpresaDTO;
import com.example.demo.repository.ReporteOfertaEmpresaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReporteOfertaEmpresaService {

    // Únicos valores válidos de Top — coinciden con las opciones del combobox
    private static final List<Integer> TOPS_VALIDOS =
            List.of(5, 10, 15, 20);

    // ✅ Fix: los valores reales de la columna estado_oferta en la BD
    // (en minúscula — el SP aplica LOWER() en ambos lados para la comparación,
    //  así que el frontend puede enviar cualquier capitalización y el SP lo acepta;
    //  pero validamos aquí en minúscula para consistencia interna)
    private static final List<String> ESTADOS_VALIDOS =
            List.of("aprobado", "pendiente", "rechazada", "cancelada");

    private final ReporteOfertaEmpresaRepository repository;

    public ReporteOfertaEmpresaService(ReporteOfertaEmpresaRepository repository) {
        this.repository = repository;
    }

    public List<ReporteOfertaEmpresaDTO> obtenerReporte(
            FiltroReporteOfertaEmpresaDTO filtro) {

        // ── Validación 1: idEmpresa obligatorio ──────────────────────────
        if (filtro.getIdEmpresa() == null) {
            throw new IllegalArgumentException(
                    "El id de empresa es obligatorio para generar el reporte"
            );
        }

        // ── Validación 2: top debe ser uno de los valores permitidos ─────
        if (filtro.getTop() != null
                && !TOPS_VALIDOS.contains(filtro.getTop())) {
            throw new IllegalArgumentException(
                    "El valor de Top debe ser 5, 10, 15 o 20"
            );
        }

        // ── Validación 3: estado válido ──────────────────────────────────
        // ✅ Fix: el controller ya normaliza '' a null, así que aquí
        // estadoOferta es null (sin filtro) o un valor no vacío.
        // Comparamos en minúscula para no depender de la capitalización
        // que envíe el frontend.
        if (filtro.getEstadoOferta() != null) {
            String estadoLower = filtro.getEstadoOferta().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estadoLower)) {
                throw new IllegalArgumentException(
                        "El estado debe ser: aprobado, pendiente, rechazada o cancelada"
                );
            }
            // Normalizar a minúscula para que el SP lo reciba consistente
            filtro.setEstadoOferta(estadoLower);
        }

        // ── Validación 4: rango de fechas coherente ──────────────────────
        if (filtro.getFechaInicio() != null
                && filtro.getFechaFin() != null
                && filtro.getFechaFin().isBefore(filtro.getFechaInicio())) {
            throw new IllegalArgumentException(
                    "La fecha fin no puede ser anterior a la fecha inicio"
            );
        }

        // ── Validación 5: fechas no futuras ──────────────────────────────
        LocalDate hoy = LocalDate.now();
        if (filtro.getFechaInicio() != null
                && filtro.getFechaInicio().isAfter(hoy)) {
            throw new IllegalArgumentException(
                    "La fecha inicio no puede ser una fecha futura"
            );
        }
        if (filtro.getFechaFin() != null
                && filtro.getFechaFin().isAfter(hoy)) {
            throw new IllegalArgumentException(
                    "La fecha fin no puede ser una fecha futura"
            );
        }

        // ── Validación 6: salarios no negativos ──────────────────────────
        if (filtro.getSalarioMin() != null
                && filtro.getSalarioMin().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El salario mínimo no puede ser negativo"
            );
        }
        if (filtro.getSalarioMax() != null
                && filtro.getSalarioMax().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El salario máximo no puede ser negativo"
            );
        }

        // ── Validación 7: rango salarial coherente ───────────────────────
        if (filtro.getSalarioMin() != null
                && filtro.getSalarioMax() != null
                && filtro.getSalarioMax()
                .compareTo(filtro.getSalarioMin()) < 0) {
            throw new IllegalArgumentException(
                    "El salario máximo no puede ser menor al salario mínimo"
            );
        }

        return repository.ejecutarReporte(filtro);
    }
}