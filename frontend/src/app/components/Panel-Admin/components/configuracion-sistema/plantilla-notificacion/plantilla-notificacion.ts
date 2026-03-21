import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantillaNotificacionService } from '../../../services/plantilla-notificacion.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PlantillaDTO {
  idPlantilla: number;
  tipo: string;
  titulo: string;
  contenido: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface HistorialItem {
  idHistorial: number;
  adminNombre: string;
  adminEmail: string;
  accion: string;
  tituloAnterior: string;
  tituloNuevo: string;
  contenidoAnterior: string;
  contenidoNuevo: string;
  fechaCreacion: string;
  ipAddress?: string;
}

@Component({
  selector: 'app-plantilla-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plantilla-notificacion.html',
  styleUrls: ['./plantilla-notificacion.css']
})
export class PlantillaNotificacionComponent implements OnInit {

  @ViewChild('editorRef') editorRef!: ElementRef;

  plantillas: PlantillaDTO[] = [];
  plantillaSeleccionada: PlantillaDTO | null = null;
  historial: HistorialItem[] = [];
  variablesProtegidas: string[] = [];

  tituloEditado: string = '';
  contenidoEditado: string = '';

  cargando: boolean = true;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  expandidoHistorial: { [key: number]: boolean } = {};
  filaExpandidaIndex: number | null = null;
  mostrarSeccionPlantillas: boolean = true;
  mostrarSeccionEditar: boolean = false;
  mostrarSeccionHistorial: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private plantillaService: PlantillaNotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    this.cargando = true;
    this.plantillaService.obtenerPlantillas().subscribe({
      next: (plantillas: PlantillaDTO[]) => {
        this.plantillas = plantillas;
        if (plantillas.length > 0) {
          this.seleccionarPlantilla(plantillas[0]);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando plantillas:', err);
        this.mensajeError = 'Error al cargar plantillas';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarPlantilla(plantilla: PlantillaDTO): void {
    this.plantillaSeleccionada = plantilla;
    this.tituloEditado = plantilla.titulo;
    this.contenidoEditado = plantilla.contenido;
    this.variablesProtegidas = this.extraerVariables(plantilla.contenido);

    this.mensajeExito = '';
    this.mensajeError = '';
    this.mostrarSeccionEditar = true;
    this.mostrarSeccionHistorial = true;
    this.cargarHistorial();

    setTimeout(() => this.renderizarEditor(), 50);
  }

  contenidoAHtml(texto: string): string {
    const escaped = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    return escaped.replace(/(\{\{[^}]+\}\}|\{[^}]+\})/g, (match) => {
      return `<span class="var-chip" contenteditable="false" data-var="${match}" style="font-weight: bold; font-style: italic; font-family: monospace; color: #5b21b6; background-color: #ede9fe; padding: 2px 4px; border-radius: 4px;">${match}</span>`;
    });
  }

  // 🔥 Helper global para limpiar Emojis y Símbolos de cualquier texto antes del PDF
  private purgarTextosPdf(str: string): string {
    if (!str) return '(Vacío)';
    return str
      .replace(/<[^>]+>/g, '') // Quitar HTML
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Arrows
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Ext
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Zero width spaces
      .replace(/\r\n|\r|\n/g, ' ')            // Saltos a espacios para evitar desborde
      .trim();
  }

  // ==========================================
  // PDF 1: CONSTANCIA INDIVIDUAL
  // ==========================================
  generarConstanciaPdf(item: HistorialItem, event: Event): void {
    event.stopPropagation();
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('BOLSA DE EMPLEO UTEQ', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CONSTANCIA DE AUDITORÍA', 196, 20, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(30, 41, 59);
    doc.line(14, 25, 196, 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('REPORTE DE EDICIÓN DE PLANTILLA', 105, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`ID de Registro: #${item.idHistorial}  |  Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 105, 45, { align: 'center' });

    let startY = 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. DATOS DEL RESPONSABLE', 14, startY);

    autoTable(doc, {
      startY: startY + 5,
      theme: 'plain',
      body: [
        ['Administrador:', this.purgarTextosPdf(item.adminNombre)],
        ['Correo:', item.adminEmail],
        ['IP de Origen:', item.ipAddress || 'No registrada']
      ],
      styles: { fontSize: 10, cellPadding: 2, textColor: [71, 85, 105] },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 40 } }
    });

    let nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. DETALLE DE LA OPERACIÓN', 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      theme: 'grid',
      body: [
        ['Plantilla Editada:', this.plantillaSeleccionada?.tipo || 'Desconocida'],
        ['Acción:', item.accion],
        ['Fecha y Hora:', this.formatearFecha(item.fechaCreacion)]
      ],
      styles: { fontSize: 10, cellPadding: 3, textColor: [71, 85, 105], lineColor: [226, 232, 240], lineWidth: 0.1 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 40, fillColor: [248, 250, 252] } }
    });

    nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. DETALLE DE LOS CAMBIOS', 14, nextY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Comparativa de los valores antes y después de la modificación:', 14, nextY + 5);

    const cambiosBody = [];
    if (item.tituloAnterior !== item.tituloNuevo) {
      cambiosBody.push(['ASUNTO/TÍTULO ANTERIOR', this.purgarTextosPdf(item.tituloAnterior)]);
      cambiosBody.push(['ASUNTO/TÍTULO NUEVO', this.purgarTextosPdf(item.tituloNuevo)]);
    }

    if (item.contenidoAnterior !== item.contenidoNuevo) {
      cambiosBody.push(['CONTENIDO ANTERIOR', this.purgarTextosPdf(item.contenidoAnterior)]);
      cambiosBody.push(['CONTENIDO NUEVO', this.purgarTextosPdf(item.contenidoNuevo)]);
    }

    if (cambiosBody.length === 0) {
      cambiosBody.push(['SIN CAMBIOS', 'No se detectaron modificaciones sustanciales.']);
    }

    autoTable(doc, {
      startY: nextY + 8,
      theme: 'grid',
      body: cambiosBody,
      bodyStyles: { font: 'courier', textColor: [15, 23, 42], valign: 'middle', cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
        1: { cellWidth: 'wrap' }
      },
      styles: { lineColor: [203, 213, 225], lineWidth: 0.1, overflow: 'linebreak' }
    });

    nextY = (doc as any).lastAutoTable.finalY + 35;
    if (nextY > 270) { doc.addPage(); nextY = 40; }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    // Firma centrada, sin Sello del Sistema
    doc.text('__________________________________', 105, nextY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Administrador', 105, nextY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(this.purgarTextosPdf(item.adminNombre), 105, nextY + 10, { align: 'center' });

    doc.save(`Constancia_Plantilla_${item.idHistorial}.pdf`);
  }

  // ==========================================
  // PDF 2: REPORTE COMPLETO POR TIPO
  // ==========================================
  exportarReporteGeneralPorTipoPdf(): void {
    if (!this.plantillaSeleccionada || this.historial.length === 0) {
      this.mensajeError = '❌ No hay historial para exportar de esta plantilla.';
      return;
    }

    const doc = new jsPDF('landscape');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('BOLSA DE EMPLEO UTEQ', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`REPORTE GENERAL DE AUDITORÍA: PLANTILLA '${this.plantillaSeleccionada.tipo}'`, 14, 28);

    doc.setFontSize(10);
    doc.text(`Emisión: ${new Date().toLocaleDateString('es-ES')}`, 280, 20, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(30, 41, 59);
    doc.line(14, 32, 280, 32);

    const bodyData = this.historial.map(item => {
      const cambioAsunto = item.tituloAnterior !== item.tituloNuevo ? 'SÍ' : 'NO';
      const cambioCuerpo = item.contenidoAnterior !== item.contenidoNuevo ? 'SÍ' : 'NO';

      return [
        item.idHistorial,
        this.formatearFecha(item.fechaCreacion),
        item.accion,
        this.purgarTextosPdf(item.adminNombre),
        cambioAsunto,
        cambioCuerpo
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'FECHA Y HORA', 'ACCIÓN', 'ADMINISTRADOR', 'CAMBIO ASUNTO', 'CAMBIO CUERPO']],
      body: bodyData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
      bodyStyles: { fontSize: 9, textColor: [15, 23, 42], valign: 'middle' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 60 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 30 }
      }
    });

    doc.save(`Reporte_General_Plantilla_${this.plantillaSeleccionada.tipo}.pdf`);
  }

  // --- LÓGICA DE PAGINACIÓN ---
  get plantillasPaginadas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.plantillas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.plantillas.length / this.itemsPerPage);
  }

  irPrimeraPagina() { this.currentPage = 1; }
  irUltimaPagina() { this.currentPage = this.totalPages; }
  paginaAnterior() { if (this.currentPage > 1) this.currentPage--; }
  paginaSiguiente() { if (this.currentPage < this.totalPages) this.currentPage++; }

  toggleSeccion(seccion: 'plantillas' | 'editar' | 'historial'): void {
    if (seccion === 'plantillas') this.mostrarSeccionPlantillas = !this.mostrarSeccionPlantillas;
    if (seccion === 'editar') this.mostrarSeccionEditar = !this.mostrarSeccionEditar;
    if (seccion === 'historial') this.mostrarSeccionHistorial = !this.mostrarSeccionHistorial;
  }

  renderizarEditor(): void {
    if (!this.editorRef) return;
    const el = this.editorRef.nativeElement;
    el.innerHTML = this.contenidoAHtml(this.contenidoEditado);
  }

  extraerContenidoReal(): string {
    if (!this.editorRef) return this.contenidoEditado;
    const el = this.editorRef.nativeElement;
    const clon = el.cloneNode(true) as HTMLElement;

    clon.querySelectorAll('.var-chip').forEach((span: Element) => {
      const valorOriginal = span.getAttribute('data-var') || '';
      const text = document.createTextNode(valorOriginal);
      span.replaceWith(text);
    });

    return clon.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  extraerVariables(texto: string): string[] {
    const matches = texto.match(/(\{\{[^}]+\}\}|\{[^}]+\})/g) || [];
    return Array.from(new Set(matches));
  }

  guardarCambios(): void {
    if (!this.plantillaSeleccionada) return;

    if (!this.tituloEditado?.trim()) {
      this.mensajeError = '❌ El título no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    const contenidoReal = this.extraerContenidoReal();

    if (!contenidoReal?.trim()) {
      this.mensajeError = '❌ El contenido no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    if (this.tituloEditado === this.plantillaSeleccionada.titulo &&
      contenidoReal === this.plantillaSeleccionada.contenido) {
      this.mensajeError = '❌ No hay cambios para guardar';
      this.mensajeExito = '';
      return;
    }

    this.guardando = true;

    this.plantillaService.actualizarPlantilla(
      this.plantillaSeleccionada.idPlantilla,
      this.tituloEditado,
      contenidoReal
    ).subscribe({
      next: (response: any) => {
        if (response.exito) {
          this.mensajeExito = response.mensaje;
          this.mensajeError = '';
          this.plantillaSeleccionada!.titulo = this.tituloEditado;
          this.plantillaSeleccionada!.contenido = contenidoReal;
          this.contenidoEditado = contenidoReal;
          this.cargarHistorial();
        } else {
          this.mensajeError = response.mensaje;
          this.mensajeExito = '';
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeError = '❌ Error al guardar: ' + (err.error?.mensaje || err.message);
        this.mensajeExito = '';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilaHistorial(index: number) {
    this.filaExpandidaIndex = this.filaExpandidaIndex === index ? null : index;
  }

  cancelarCambios(): void {
    if (!this.plantillaSeleccionada) return;
    this.tituloEditado = this.plantillaSeleccionada.titulo;
    this.contenidoEditado = this.plantillaSeleccionada.contenido;
    this.mensajeError = '';
    this.mensajeExito = '';
    setTimeout(() => this.renderizarEditor(), 50);
  }

  cargarHistorial(): void {
    if (!this.plantillaSeleccionada) return;
    this.plantillaService.obtenerHistorial(this.plantillaSeleccionada.idPlantilla).subscribe({
      next: (data: HistorialItem[]) => {
        this.historial = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando historial:', err)
    });
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
}
