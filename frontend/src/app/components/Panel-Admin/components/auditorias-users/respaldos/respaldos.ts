import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { SistemaConfigService } from '../../../services/sistema-config.service'; // 👈 ajusta el path
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-respaldos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respaldos.html',
  styleUrls: ['./respaldos.css']
})
export class RespaldosComponent implements OnInit {

  private adminService        = inject(AdminService);
  private sistemaConfigService = inject(SistemaConfigService);
  private cdr                 = inject(ChangeDetectorRef);

  textoBusqueda: string = '';
  resumenBackups: any[] = [];

  modalAbierto: boolean = false;
  usuarioSeleccionado: string = '';
  detallesHistorial: any[] = [];
  cargandoDetalles: boolean = false;

  // ✅ Logo del sistema
  logoSistema: string = '';

  ngOnInit(): void {
    this.cargarResumen();

    // ✅ Suscribirse al logo igual que en tus otros componentes
    this.sistemaConfigService.logo$.subscribe((url: string) => {
      this.logoSistema = url;
      this.cdr.detectChanges();
    });
  }

  cargarResumen(): void {
    this.adminService.obtenerResumenRespaldos().subscribe({
      next: (data) => { this.resumenBackups = data; },
      error: (err) => { console.error('Error al cargar el resumen:', err); }
    });
  }

  abrirDetalle(usuario: any): void {
    const id = usuario.id_usuario || usuario.idUsuario;
    if (!id) { console.error('ID no encontrado:', usuario); return; }

    this.usuarioSeleccionado = usuario.correo_ejecutor;
    this.modalAbierto = true;
    this.cargandoDetalles = true;
    this.detallesHistorial = [];

    this.adminService.obtenerDetalleRespaldos(usuario.id_usuario).subscribe({
      next: (data) => { this.detallesHistorial = data; this.cargandoDetalles = false; },
      error: (err) => { console.error('Error:', err); this.cargandoDetalles = false; }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.detallesHistorial = [];
  }

  // ✅ Convierte una URL de imagen a base64 para jsPDF
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
      img.onerror = () => reject('No se pudo cargar el logo');
      img.src = url;
    });
  }

  // ✅ Genera y descarga el PDF con encabezado institucional
  async exportarHistorialPDF(): Promise<void> {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleString('es-EC');
    const pageWidth = doc.internal.pageSize.getWidth();

    // — 1. Logo —
    if (this.logoSistema) {
      try {
        const base64 = await this.urlToBase64(this.logoSistema);
        doc.addImage(base64, 'PNG', 14, 10, 18, 18); // x, y, ancho, alto
      } catch {
        console.warn('No se pudo cargar el logo en el PDF');
      }
    }

    // — 2. Título principal (igual al de la imagen) —
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 153); // azul oscuro
    doc.text('BOLSA DE EMPLEOS', 36, 17);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('RESPALDOS DEL SISTEMA - Historial de ejecuciones del', 36, 23);
    doc.text(`usuario ${this.usuarioSeleccionado}`, 36, 28);

    // — 3. Caja de referencia (lado derecho, igual al de la imagen) —
    const cajaX = pageWidth - 70;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(cajaX, 10, 60, 22, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Generado: ${fechaActual}`, cajaX + 3, 17);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`Usuario: ${this.usuarioSeleccionado}`, cajaX + 3, 23);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(79, 70, 229); // violeta
    doc.text(`Total Registros: ${this.detallesHistorial.length}`, cajaX + 3, 29);

    // — 4. Línea separadora —
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 34, pageWidth - 14, 34);

    // — 5. Tabla —
    autoTable(doc, {
      startY: 38,
      head: [['#', 'Tipo', 'Estado', 'Tamaño', 'Fecha Ejecución', 'Mensaje']],
      body: this.detallesHistorial.map((item, index) => {
        console.log('🔍 item PDF:', item); // 👈 AGREGA ESTO
        return [
          index + 1,
          item.tipo_accion        || '-',
          item.estado       || '-',
          this.formatBytes(item.tamano_bytes),
          item.fecha_ejecucion
            ? new Date(item.fecha_ejecucion).toLocaleString('es-EC')
            : '-',
          item.mensaje_error || 'Sin errores'
        ];
      }),
      styles: {
        fontSize: 9,
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
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        5: { cellWidth: 45 }
      }
    });

    // — 6. Footer con número de página —
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} — Sistema de Respaldos | BOLSA DE EMPLEOS`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // — 7. Descargar —
    doc.save(`respaldo_${this.usuarioSeleccionado}_${Date.now()}.pdf`);
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
