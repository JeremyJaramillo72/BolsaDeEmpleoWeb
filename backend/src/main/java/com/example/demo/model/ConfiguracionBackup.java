package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
@Data
@Entity
@Table(name = "configuracion_backup", schema = "seguridad")
public class ConfiguracionBackup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idConfig;

    private Boolean habilitado;

    @Column(name = "hora_ejecucion")
    private LocalTime horaEjecucion;

    @Column(name = "dias_semana")
    private String diasSemana;

    @Column(name = "tipo_frecuencia")
    private String tipoFrecuencia;

    @Column(name = "intervalo")
    private Integer intervalo;

}
