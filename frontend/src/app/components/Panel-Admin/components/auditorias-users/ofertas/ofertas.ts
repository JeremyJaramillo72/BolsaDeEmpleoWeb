import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

// 1. Interfaz para la tabla principal
export interface AuditoriaOferta {
  idHistorial: number;
  idOferta: number;
  tituloOferta: string;
  empresa: string;
  usuarioBd: string;
  accion: string;
  estadoActual: string;
  fechaHora: string;
}

// 2. Interfaz para la línea de tiempo y los modales
export interface TrazabilidadOferta {
  idHistorial: number;
  accion: string;
  fechaHora: string;
  ejecutor: string;
  campoModificado: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas.html',
  styleUrls: ['./ofertas.css']
})
export class OfertasComponent implements OnInit {
  ofertasList: AuditoriaOferta[] = [];
  ofertasFiltradas: AuditoriaOferta[] = [];
  cargandoOfertas = false;
  mensajeError = '';

  filtroBusquedaOfertas = '';
  paginaOfertas = 1;
  itemsPorPaginaOfertas = 10;

  mostrarModalHistorialOferta = false;
  cargandoHistorialOferta = false;
  ofertaSeleccionada: AuditoriaOferta | null = null;

  listaHistorialOferta: TrazabilidadOferta[] = [];

  // Variables para el modal premium
  mostrarModalDetalles: boolean = false;
  trazabilidadSeleccionada: TrazabilidadOferta | null = null;
  tipoModalDetalle: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.cargandoOfertas = true;
    this.adminService.getOfertasParaAuditoria().subscribe({
      next: (data: AuditoriaOferta[]) => {
        this.ofertasList = data;
        this.aplicarFiltrosOfertas();
        this.cargandoOfertas = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de ofertas:', err);
        this.mensajeError = 'Error al cargar el registro de ofertas';
        this.cargandoOfertas = false;
      }
    });
  }

  aplicarFiltrosOfertas(): void {
    let resultado = [...this.ofertasList];
    if (this.filtroBusquedaOfertas.trim()) {
      const busqueda = this.filtroBusquedaOfertas.toLowerCase();
      resultado = resultado.filter(o =>
        (o.tituloOferta && o.tituloOferta.toLowerCase().includes(busqueda)) ||
        (o.idOferta && o.idOferta.toString().includes(busqueda)) ||
        (o.accion && o.accion.toLowerCase().includes(busqueda)) ||
        (o.usuarioBd && o.usuarioBd.toLowerCase().includes(busqueda)) ||
        (o.empresa && o.empresa.toLowerCase().includes(busqueda))
      );
    }
    this.ofertasFiltradas = resultado;
    this.paginaOfertas = 1;
  }

  limpiarFiltrosOfertas(): void {
    this.filtroBusquedaOfertas = '';
    this.aplicarFiltrosOfertas();
  }

  get ofertasPaginadas(): AuditoriaOferta[] {
    const inicio = (this.paginaOfertas - 1) * this.itemsPorPaginaOfertas;
    return this.ofertasFiltradas.slice(inicio, inicio + this.itemsPorPaginaOfertas);
  }

  get totalPaginasOfertas(): number {
    return Math.ceil(this.ofertasFiltradas.length / this.itemsPorPaginaOfertas);
  }

  cambiarPaginaOfertas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasOfertas) this.paginaOfertas = pagina;
  }

  verHistorialOferta(auditoria: AuditoriaOferta): void {
    this.ofertaSeleccionada = auditoria;
    this.mostrarModalHistorialOferta = true;
    this.cargandoHistorialOferta = true;
    this.adminService.getHistorialByOferta(auditoria.idOferta).subscribe({
      next: (data: TrazabilidadOferta[]) => {
        this.listaHistorialOferta = data;
        this.cargandoHistorialOferta = false;
      },
      error: (err) => {
        console.error('Error al cargar la línea de tiempo:', err);
        this.mensajeError = 'Error al cargar los detalles de la oferta';
        this.cargandoHistorialOferta = false;
      }
    });
  }

  cerrarModalHistorialOferta(): void {
    this.mostrarModalHistorialOferta = false;
    this.ofertaSeleccionada = null;
    this.listaHistorialOferta = [];
  }

  // 🔥 AQUÍ ESTÁ EL MÉTODO QUE FALTABA PARA EL PDF 🔥
  descargarReportePdf(): void {
    if (!this.ofertaSeleccionada) return;

    const idOferta = this.ofertaSeleccionada.idOferta;
    const tipoFiltro = 'TRAZABILIDAD_OFERTA'; // Asegúrate de que el backend soporte este tipo

    console.log(`Generando PDF para la oferta #${idOferta}...`);

    this.adminService.descargarReportePdf(idOferta, tipoFiltro).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Historial_Oferta_${idOferta}_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el PDF', error);
        this.mensajeError = 'Error al generar el reporte PDF.';
      }
    });
  }

  // ✅ LOGICA PARA ABRIR EL MODAL CON EL DISEÑO CORRECTO
  abrirModalDetallesOferta(historial: TrazabilidadOferta): void {
    this.trazabilidadSeleccionada = historial;
    const accion = (historial.accion || '').toUpperCase();

    if (accion.includes('CREADA') || accion.includes('NUEVA') || accion.includes('APROBADA')) {
      this.tipoModalDetalle = 'INSERT';
    } else if (accion.includes('ELIMINADA') || accion.includes('RETIRADA') || accion.includes('RECHAZADA')) {
      this.tipoModalDetalle = 'DELETE';
    } else {
      this.tipoModalDetalle = 'UPDATE';
    }
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.trazabilidadSeleccionada = null;
  }

  // ✅ PARSEADORES DE JSON PARA LOS MODALES PREMIUM
  getInsertDataList(audit: TrazabilidadOferta | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresNuevos) return [];
    try {
      const parsed = JSON.parse(audit.valoresNuevos);
      return Object.keys(parsed).map(k => ({
        campo: k.replace(/_/g, ' ').toUpperCase(),
        valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
      }));
    } catch { return []; }
  }

  getDeleteDataList(audit: TrazabilidadOferta | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresAnteriores) return [];
    try {
      const parsed = JSON.parse(audit.valoresAnteriores);
      return Object.keys(parsed).map(k => ({
        campo: k.replace(/_/g, ' ').toUpperCase(),
        valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
      }));
    } catch { return []; }
  }

  getUpdateDataList(audit: TrazabilidadOferta | null): Array<{nombre: string, anterior: any, nuevo: any}> {
    if (!audit) return [];
    try {
      const oldParsed = audit.valoresAnteriores ? JSON.parse(audit.valoresAnteriores) : {};
      const newParsed = audit.valoresNuevos ? JSON.parse(audit.valoresNuevos) : {};
      const allKeys = Array.from(new Set([...Object.keys(oldParsed), ...Object.keys(newParsed)]));

      return allKeys.map(k => ({
        nombre: k.replace(/_/g, ' ').toUpperCase(),
        anterior: oldParsed[k] !== undefined ? (typeof oldParsed[k] === 'object' ? JSON.stringify(oldParsed[k]) : oldParsed[k]) : 'N/A',
        nuevo: newParsed[k] !== undefined ? (typeof newParsed[k] === 'object' ? JSON.stringify(newParsed[k]) : newParsed[k]) : 'N/A'
      }));
    } catch { return []; }
  }

  // Utilidades de diseño
  getAccionOfertaClass(accion: string): string {
    if (!accion) return 'accion-otro';
    const acc = accion.toUpperCase();
    if (acc.includes('CREADA') || acc.includes('NUEVA') || acc.includes('APROBADA')) return 'accion-crear';
    if (acc.includes('ACTUALIZADA')) return 'accion-editar';
    if (acc.includes('ELIMINADA') || acc.includes('RECHAZADA') || acc.includes('RETIRADA')) return 'accion-eliminar';
    return 'accion-otro';
  }

  formatAccionOferta(accion: string | undefined | null): string {
    if (!accion) return 'Desconocida';
    return accion.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getEstadoClass(estado: string | null | undefined): string {
    if (!estado) return 'estado-pendiente';
    switch(estado.toLowerCase()) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      case 'bloqueado': return 'estado-bloqueado';
      case 'aprobado': return 'estado-activo';
      case 'pendiente': return 'estado-pendiente';
      default: return 'estado-pendiente';
    }
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
