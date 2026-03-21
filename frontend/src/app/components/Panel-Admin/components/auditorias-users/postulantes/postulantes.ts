import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { SistemaConfigService } from '../../../services/sistema-config.service'; // ajusta el path
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AuditoriaPostulante {
  idUsuario: number;
  idPerfilAcademico: number;
  nombrePostulante: string;
  correo: string;
  ultimaModificacion: string;
  totalMovimientos: number;
  fotoPerfil?: string; // ✅ agregamos la foto
}

export interface TrazabilidadPostulante {
  idHistorial: number;
  seccion: string;
  accion: string;
  fechaHora: string;
  ejecutor: string;
  camposModificados: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
}

@Component({
  selector: 'app-postulantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulantes.html',
  styleUrls: ['./postulantes.css']
})
export class PostulantesComponent implements OnInit {

  postulantesList: AuditoriaPostulante[] = [];
  postulantesFiltrados: AuditoriaPostulante[] = [];
  cargandoPostulantes = false;
  mensajeError = '';
  filtroBusqueda = '';
  paginaActual = 1;
  itemsPorPagina = 10;

  mostrarModalHistorial = false;
  cargandoHistorial = false;
  postulanteSeleccionado: AuditoriaPostulante | null = null;
  listaHistorial: TrazabilidadPostulante[] = [];

  mostrarModalDetalles = false;
  trazabilidadSeleccionada: TrazabilidadPostulante | null = null;
  tipoModalDetalle: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE';

  // ✅ Logo y foto
  logoSistema: string = '';

  constructor(
    private adminService: AdminService,
    private sistemaConfigService: SistemaConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPostulantes();

    // ✅ Suscribirse al logo
    this.sistemaConfigService.logo$.subscribe((url: string) => {
      this.logoSistema = url;
      this.cdr.detectChanges();
    });
  }

  // ✅ Convierte URL a base64 para jsPDF
  private async urlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject('No se pudo cargar imagen');
      img.src = url;
    });
  }

  cargarPostulantes(): void {
    this.cargandoPostulantes = true;
    this.adminService.getPostulantesAuditoria().subscribe({
      next: (data: AuditoriaPostulante[]) => {
        this.postulantesList = data;
        this.aplicarFiltros();
        this.cargandoPostulantes = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de postulantes:', err);
        this.mensajeError = 'Error al cargar los registros.';
        this.cargandoPostulantes = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.postulantesList];
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        (p.nombrePostulante && p.nombrePostulante.toLowerCase().includes(busqueda)) ||
        (p.correo && p.correo.toLowerCase().includes(busqueda))
      );
    }
    this.postulantesFiltrados = resultado;
    this.paginaActual = 1;
  }

  get postulantesPaginados(): AuditoriaPostulante[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.postulantesFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.postulantesFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  verHistorial(postulante: AuditoriaPostulante): void {
    this.postulanteSeleccionado = postulante;
    this.mostrarModalHistorial = true;
    this.cargandoHistorial = true;

    this.adminService.getHistorialByPerfil(postulante.idPerfilAcademico).subscribe({
      next: (data: TrazabilidadPostulante[]) => {
        this.listaHistorial = data;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar la línea de tiempo:', err);
        this.cargandoHistorial = false;
      }
    });
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.postulanteSeleccionado = null;
    this.listaHistorial = [];
  }

  abrirModalDetalles(historial: TrazabilidadPostulante): void {
    this.trazabilidadSeleccionada = historial;
    const accion = (historial.accion || '').toUpperCase();
    if (accion === 'INSERT') this.tipoModalDetalle = 'INSERT';
    else if (accion === 'DELETE') this.tipoModalDetalle = 'DELETE';
    else this.tipoModalDetalle = 'UPDATE';
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.trazabilidadSeleccionada = null;
  }

  // ✅ EXPORTAR PDF DEL HISTORIAL DEL POSTULANTE
  async exportarHistorialPDF(): Promise<void> {
    if (!this.postulanteSeleccionado) return;

    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleString('es-EC');
    const pageWidth = doc.internal.pageSize.getWidth();
    const postulante = this.postulanteSeleccionado;

    // — 1. Logo del sistema —
    if (this.logoSistema) {
      try {
        const base64Logo = await this.urlToBase64(this.logoSistema);
        doc.addImage(base64Logo, 'PNG', 14, 10, 18, 18);
      } catch {
        console.warn('No se pudo cargar el logo');
      }
    }

    // — 2. Título institucional —
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 153);
    doc.text('BOLSA DE EMPLEOS', 36, 17);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('EXPEDIENTE DE TRAZABILIDAD - Historial cronológico del', 36, 23);
    doc.text(`Perfil Profesional de ${postulante.nombrePostulante}`, 36, 28);

    // — 3. Caja de referencia derecha —
    const cajaX = pageWidth - 70;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(cajaX, 10, 60, 26, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Generado: ${fechaActual}`, cajaX + 3, 17);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`Postulante ID: ${postulante.idUsuario}`, cajaX + 3, 23);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(79, 70, 229);
    doc.text(`Total Movimientos: ${this.listaHistorial.length}`, cajaX + 3, 29);
    doc.text(`Perfil ID: ${postulante.idPerfilAcademico}`, cajaX + 3, 35);

    // — 4. Línea separadora —
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 40, pageWidth - 14, 40);

    // — 5. Foto de perfil + datos del postulante —
    let startY = 45;

    // Foto de perfil (si existe)
    if (postulante.fotoPerfil) {
      try {
        const base64Foto = await this.urlToBase64(postulante.fotoPerfil);
        // Foto circular simulada con rectángulo redondeado
        doc.addImage(base64Foto, 'PNG', 14, startY, 22, 22);
      } catch {
        console.warn('No se pudo cargar la foto de perfil');
      }
    }

    const infoX = postulante.fotoPerfil ? 40 : 14;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(postulante.nombrePostulante, infoX, startY + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`✉ ${postulante.correo}`, infoX, startY + 13);
    doc.text(
      `Última modificación: ${this.formatearFechaHora(postulante.ultimaModificacion)}`,
      infoX, startY + 19
    );

    startY += 30;

    // — 6. Tabla del historial —
    autoTable(doc, {
      startY,
      head: [['#', 'Sección', 'Acción', 'Campos Modificados', 'Ejecutor', 'Fecha']],
      body: this.listaHistorial.map((item, index) => [
        index + 1,
        this.formatSeccion(item.seccion),
        item.accion || '-',
        item.camposModificados || 'N/A',
        item.ejecutor || 'Desconocido',
        this.formatearFechaHora(item.fechaHora)
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255]
      },
      // ✅ Color por tipo de acción en columna Acción
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const accion = String(data.cell.raw).toUpperCase();
          if (accion === 'INSERT') data.cell.styles.textColor = [5, 150, 105];
          else if (accion === 'UPDATE') data.cell.styles.textColor = [37, 99, 235];
          else if (accion === 'DELETE') data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center', cellWidth: 18 },
        3: { cellWidth: 45 },
        5: { cellWidth: 32 }
      }
    });

    // — 7. Footer —
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} — Trazabilidad del Perfil | BOLSA DE EMPLEOS`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // — 8. Descargar —
    doc.save(`trazabilidad_${postulante.nombrePostulante.replace(/ /g, '_')}_${Date.now()}.pdf`);
  }

  // — Utilidades —
  getInsertDataList(audit: TrazabilidadPostulante | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresNuevos) return [];
    try {
      const parsed = JSON.parse(audit.valoresNuevos);
      return Object.keys(parsed)
        .filter(k => !k.toLowerCase().startsWith('id_'))
        .map(k => ({
          campo: k.replace(/_/g, ' ').toUpperCase(),
          valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
        }));
    } catch { return []; }
  }

  getDeleteDataList(audit: TrazabilidadPostulante | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresAnteriores) return [];
    try {
      const parsed = JSON.parse(audit.valoresAnteriores);
      return Object.keys(parsed)
        .filter(k => !k.toLowerCase().startsWith('id_'))
        .map(k => ({
          campo: k.replace(/_/g, ' ').toUpperCase(),
          valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
        }));
    } catch { return []; }
  }

  getUpdateDataList(audit: TrazabilidadPostulante | null): Array<{nombre: string, anterior: any, nuevo: any}> {
    if (!audit) return [];
    try {
      const oldParsed = audit.valoresAnteriores ? JSON.parse(audit.valoresAnteriores) : {};
      const newParsed = audit.valoresNuevos ? JSON.parse(audit.valoresNuevos) : {};
      const allKeys = Array.from(new Set([...Object.keys(oldParsed), ...Object.keys(newParsed)]));
      return allKeys
        .filter(k => !k.toLowerCase().startsWith('id_'))
        .map(k => ({
          nombre: k.replace(/_/g, ' ').toUpperCase(),
          anterior: oldParsed[k] !== undefined ? (typeof oldParsed[k] === 'object' ? JSON.stringify(oldParsed[k]) : oldParsed[k]) : 'N/A',
          nuevo: newParsed[k] !== undefined ? (typeof newParsed[k] === 'object' ? JSON.stringify(newParsed[k]) : newParsed[k]) : 'N/A'
        }));
    } catch { return []; }
  }

  formatSeccion(seccion: string): string {
    if (!seccion) return 'Perfil';
    const nombres: {[key: string]: string} = {
      'PERFIL_ACADEMICO': 'Información Académica',
      'EXP_LABORAL': 'Experiencia Laboral',
      'CURSOS': 'Cursos y Certificaciones',
      'USUARIO_IDIOMA': 'Idiomas',
      'DOCUMENTACION_ACADEMICA': 'Documentos',
      'EXP_LABORAL_CARGO': 'Cargos Desempeñados'
    };
    return nombres[seccion.toUpperCase()] || seccion.replace(/_/g, ' ');
  }

  getIconoSeccion(seccion: string): string {
    const sec = seccion?.toUpperCase() || '';
    if (sec.includes('ACADEMICO') || sec.includes('CURSOS')) return 'school';
    if (sec.includes('EXP_LABORAL')) return 'work';
    if (sec.includes('IDIOMA')) return 'translate';
    if (sec.includes('DOCUMENTO')) return 'description';
    return 'person';
  }

  getAccionClass(accion: string): string {
    if (!accion) return 'accion-otro';
    const acc = accion.toUpperCase();
    if (acc === 'INSERT') return 'accion-crear';
    if (acc === 'UPDATE') return 'accion-editar';
    if (acc === 'DELETE') return 'accion-eliminar';
    return 'accion-otro';
  }

  formatearFechaHora(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
