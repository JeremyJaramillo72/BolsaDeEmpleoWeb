import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionCorreoService } from '../../../services/configuracion-correo.service';
import { Router } from '@angular/router';

export interface ConfiguracionCorreoDTO {
  idConfiguracion: number | null;
  tipo: string;
  valor: string;
  password?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface HistorialItem {
  idHistorial: number;
  adminNombre: string;
  adminEmail: string;
  accion: string;
  valorAnterior: string;
  valorNuevo: string;
  fechaCreacion: string;
  exitoso: boolean;
  detalleError?: string;
  ipAddress?: string;
}

@Component({
  selector: 'app-configuracion-correo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-correo.html',
  styleUrls: ['./configuracion-correo.css']
})
export class ConfiguracionCorreoComponent implements OnInit {
  configuracion: ConfiguracionCorreoDTO | null = null;
  historial: HistorialItem[] = [];

  correoNuevo: string = '';
  correoParaPrueba: string = '';

  // SMTP Configuration Fields
  smtpPassword: string = '';
  mostrarPassword: boolean = false;

  cargando: boolean = true;
  enviandoPrueba: boolean = false;
  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';
  mensajePrueba: string = '';
  tipoPrueba: 'exito' | 'error' | '' = '';

  expandidoHistorial: { [key: number]: boolean } = {};
  infoBoxes: { [key: string]: boolean } = {
    appPassword: true
  };

  constructor(
    private configuracionService: ConfiguracionCorreoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.configuracionService.obtenerConfiguracion().subscribe({
      next: (config) => {
        this.configuracion = config;
        this.correoNuevo = config.valor;
        this.correoParaPrueba = config.valor;

        // Load SMTP password
        this.smtpPassword = config.password ? '***ENCRIPTADA***' : '';

        this.cargarHistorial();
      },
      error: (err) => {
        console.error('Error cargando configuración:', err);
        this.mensajeError = 'Error al cargar configuración';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarHistorial(): void {
    this.configuracionService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  probarCorreo(): void {
    if (!this.correoParaPrueba || !this.validarCorreo(this.correoParaPrueba)) {
      this.mensajePrueba = '❌ Ingresa un correo válido';
      this.tipoPrueba = 'error';
      return;
    }

    this.enviandoPrueba = true;
    this.mensajePrueba = 'Enviando email de prueba...';
    this.tipoPrueba = '';

    this.configuracionService.probarCorreo(this.correoParaPrueba).subscribe({
      next: (response) => {
        if (response.exito) {
          this.mensajePrueba = response.mensaje;
          this.tipoPrueba = 'exito';
        } else {
          this.mensajePrueba = response.mensaje;
          this.tipoPrueba = 'error';
        }
        this.enviandoPrueba = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.mensajePrueba = '❌ Error al enviar email: ' + (err.error?.mensaje || err.message);
        this.tipoPrueba = 'error';
        this.enviandoPrueba = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarCambios(): void {
    if (!this.correoNuevo || !this.validarCorreo(this.correoNuevo)) {
      this.mensajeError = '❌ Email inválido';
      this.mensajeExito = '';
      return;
    }

    if (this.correoNuevo === this.configuracion?.valor && this.smtpPassword === '***ENCRIPTADA***') {
      this.mensajeError = '❌ No hay cambios';
      this.mensajeExito = '';
      return;
    }

    if (!this.smtpPassword || this.smtpPassword.trim() === '') {
      this.mensajeError = '❌ Contraseña/Token no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const idUsuario = localStorage.getItem('idUsuario');

    const config = {
      valor: this.correoNuevo,
      password: this.smtpPassword
    };

    this.configuracionService.actualizarConfiguracionSmtp(config, idUsuario).subscribe({
      next: (response) => {
        if (response.exito) {
          this.mensajeExito = response.mensaje;
          this.cargarDatos();
        } else {
          this.mensajeError = response.mensaje;
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.mensajeError = '❌ Error al guardar: ' + (err.error?.mensaje || err.message);
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  validarCorreo(correo: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  }

  toggleHistorial(idHistorial: number): void {
    this.expandidoHistorial[idHistorial] = !this.expandidoHistorial[idHistorial];
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

  getStatusColor(exitoso: boolean): string {
    return exitoso ? '#10b981' : '#ef4444';
  }

  getStatusIcon(exitoso: boolean): string {
    return exitoso ? '✅' : '❌';
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleInfoBox(key: string): void {
    this.infoBoxes[key] = !this.infoBoxes[key];
  }
}
