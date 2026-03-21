import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionCorreoService } from '../../../services/configuracion-correo.service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
/*
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
 */
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

  mostrarAyudaToken: boolean = false;
  historialActivo: number | null = null;
  openSection: string = 'config'; // 'config', 'test', 'update', 'history'

  constructor(
    private configuracionService: ConfiguracionCorreoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

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


  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
    } else {
      return date.toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'});
    }
  }

  generarConstanciaPdf(item: HistorialItem): void {
    const doc = new jsPDF();

    // --- HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Gris sutil UTEQ
    doc.text('BOLSA DE EMPLEO UTEQ', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Gris oscuro Slate
    doc.text('CONSTANCIA DE AUDITORÍA', 196, 20, { align: 'right' });

    // Línea divisoria elegante
    doc.setLineWidth(0.5);
    doc.setDrawColor(30, 41, 59);
    doc.line(14, 25, 196, 25);

    // --- TÍTULO PRINCIPAL ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('REPORTE INDIVIDUAL DE CAMBIO SMTP', 105, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`ID de Registro: #${item.idHistorial}  |  Emisión: ${new Date().toLocaleDateString('es-ES')}`, 105, 45, { align: 'center' });

    // --- SECCIÓN 1: RESPONSABLE ---
    let startY = 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. DATOS DEL RESPONSABLE', 14, startY);

    autoTable(doc, {
      startY: startY + 5,
      theme: 'plain',
      body: [
        ['Administrador:', item.adminNombre],
        ['Correo:', item.adminEmail],
        ['IP de Origen:', item.ipAddress || 'No registrada']
      ],
      styles: { fontSize: 10, cellPadding: 2, textColor: [71, 85, 105] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 40 }
      }
    });

    // --- SECCIÓN 2: OPERACIÓN ---
    let nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. DETALLE DE LA OPERACIÓN', 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      theme: 'grid',
      body: [
        ['Módulo:', 'Configuración de Correo (SMTP)'],
        ['Acción Realizada:', item.accion],
        // Quitamos los emojis de check y X para evitar errores en el PDF
        ['Estado:', item.exitoso ? 'COMPLETADO CON EXITO' : 'FALLIDO'],
        ['Fecha y Hora:', this.formatearFecha(item.fechaCreacion)]
      ],
      styles: { fontSize: 10, cellPadding: 3, textColor: [71, 85, 105], lineColor: [226, 232, 240], lineWidth: 0.1 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 40, fillColor: [248, 250, 252] }
      },
      willDrawCell: function(data) {
        // Pintamos el texto de éxito de verde o rojo sin usar emojis
        if (data.row.index === 2 && data.column.index === 1) {
          doc.setTextColor(item.exitoso ? 22 : 220, item.exitoso ? 163 : 38, item.exitoso ? 74 : 38);
          doc.setFont('helvetica', 'bold');
        }
      }
    });

    // --- SECCIÓN 3: TRAZABILIDAD (RESTAURO A DOS COLUMNAS) ---
    nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. DETALLE DE LOS CAMBIOS (TRAZABILIDAD)', 14, nextY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Comparativa del correo de envío antes y después de la modificación:', 14, nextY + 5);

    autoTable(doc, {
      startY: nextY + 8,
      theme: 'grid',
      head: [['VALOR ANTERIOR', 'VALOR NUEVO']],
      body: [
        [item.valorAnterior || '(Vacío)', item.valorNuevo || '(Vacío)']
      ],
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', halign: 'center' }, // Cabecera oscura
      bodyStyles: { font: 'courier', textColor: [15, 23, 42], halign: 'center', valign: 'middle', cellPadding: 5 }, // Fuente tipo código
      styles: { lineColor: [203, 213, 225], lineWidth: 0.1 }
    });

    // Si hay un error, lo ponemos en una tablita extra abajo
    if (item.detalleError) {
      nextY = (doc as any).lastAutoTable.finalY + 5;
      autoTable(doc, {
        startY: nextY,
        theme: 'grid',
        body: [['MOTIVO DE FALLO:', item.detalleError]],
        bodyStyles: { textColor: [220, 38, 38], cellPadding: 3, fontSize: 9 }, // Letra roja
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [254, 242, 242] } },
        styles: { lineColor: [252, 165, 165], lineWidth: 0.1 }
      });
    }

    // --- FIRMAS Y SELLO ---
    nextY = (doc as any).lastAutoTable.finalY + 35;
    if (nextY > 270) { doc.addPage(); nextY = 40; }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    // Firma izquierda
    doc.text('__________________________________', 55, nextY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Administrador', 55, nextY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(item.adminNombre, 55, nextY + 10, { align: 'center' });

    // Sello derecha
    doc.text('__________________________________', 155, nextY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Sello del Sistema', 155, nextY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(8);
    doc.text('Validado automáticamente por el módulo', 155, nextY + 10, { align: 'center' });
    doc.text('de Auditoría - Bolsa de Empleo UTEQ.', 155, nextY + 13, { align: 'center' });
    doc.text(`ID Único de Verificación: UTEQ-SMTP-${item.idHistorial}`, 155, nextY + 16, { align: 'center' });

    // Descarga
    doc.save(`Constancia_Individual_SMTP_${item.idHistorial}.pdf`);
  }
  // Helper para limpiar el HTML y que el texto se acomode bien en el PDF
  private limpiarContenidoParaPdf(html: string): string {
    if (!html) return '(Vacío)';
    // 1. Convertir tags de salto comunes en \n para que jspdf los entienda
    let text = html.replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n');
    // 2. Eliminar todos los demás tags HTML (<strong>, <span>, etc.)
    text = text.replace(/<[^>]+>/g, '');
    // 3. Decodificar entidades HTML básicas (&amp; -> &) y limpiar espacios extra
    return text.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  exportarHistorialCompletoPdf(): void {
    if (!this.historial || this.historial.length === 0) {
      this.mensajeError = 'No hay registros para exportar.';
      return;
    }

    const doc = new jsPDF('landscape'); // Horizontal para que quepan bien las columnas

    // --- HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('BOLSA DE EMPLEO UTEQ', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('REPORTE GENERAL DE AUDITORÍA - CONFIGURACIÓN SMTP', 14, 28);

    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 280, 20, { align: 'right' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(30, 41, 59);
    doc.line(14, 32, 280, 32);

    // --- TABLA DE DATOS ---
    // Preparamos los datos extrayendo lo importante de cada item del historial
    const bodyData = this.historial.map(item => [
      item.idHistorial,
      this.formatearFecha(item.fechaCreacion),
      item.adminNombre,
      item.accion,
      item.valorNuevo,
      item.exitoso ? 'ÉXITO' : 'FALLO'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'FECHA Y HORA', 'ADMINISTRADOR', 'ACCIÓN', 'NUEVO VALOR', 'ESTADO']],
      body: bodyData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [15, 23, 42],
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // ID
        1: { cellWidth: 40 }, // Fecha
        2: { cellWidth: 50 }, // Admin
        3: { cellWidth: 50 }, // Acción
        4: { font: 'courier', cellWidth: 'auto' }, // Valor
        5: { halign: 'center', cellWidth: 25, fontStyle: 'bold' } // Estado
      },
      willDrawCell: function(data) {
        // Pintar la celda de estado de verde o rojo
        if (data.section === 'body' && data.column.index === 5) {
          const estado = data.cell.raw;
          if (estado === 'ÉXITO') {
            doc.setTextColor(22, 163, 38); // Verde
          } else {
            doc.setTextColor(220, 38, 38); // Rojo
          }
        }
      }
    });

    // Descarga del archivo
    doc.save(`Reporte_Historial_SMTP_${new Date().getTime()}.pdf`);
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

  toggleAyudaToken(): void {
    this.mostrarAyudaToken = !this.mostrarAyudaToken;
  }
  toggleHistorial(idHistorial: number): void {
    if (this.historialActivo === idHistorial) {
      this.historialActivo = null;
    } else {
      this.historialActivo = idHistorial;
    }
  }
  toggleSection(section: string): void {
    if (this.openSection === section) {
      this.openSection = ''; // cierra si ya estaba abierta
    } else {
      this.openSection = section; // abre la nueva y cierra la anterior
    }
  }
}
