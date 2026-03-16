import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

export interface AuditoriaOferta {
  idHistorial?: number;
  idOferta: number;
  tituloOferta: string;
  empresa: string;
  usuarioBd: string;
  accion: string;
  estadoActual: string;
  fechaHora: string;
  campoModificado?: string;
  valoresAnteriores?: any;
  valoresNuevos?: any;
  idSeguridad?: number;
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
  listaHistorialOferta: AuditoriaOferta[] = [];

  mostrarModalDetalles: boolean = false;
  auditoriaDetalleSeleccionada: any = null;
  listaDeUsuarios: any[] = [];

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
    const fin = inicio + this.itemsPorPaginaOfertas;
    return this.ofertasFiltradas.slice(inicio, fin);
  }

  get totalPaginasOfertas(): number {
    return Math.ceil(this.ofertasFiltradas.length / this.itemsPorPaginaOfertas);
  }

  cambiarPaginaOfertas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasOfertas) {
      this.paginaOfertas = pagina;
    }
  }

  verHistorialOferta(auditoria: AuditoriaOferta): void {
    this.ofertaSeleccionada = auditoria;
    this.mostrarModalHistorialOferta = true;
    this.cargandoHistorialOferta = true;
    this.adminService.getHistorialByOferta(auditoria.idOferta).subscribe({
      next: (data: AuditoriaOferta[]) => {
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

  abrirModalDetallesOferta(historial: AuditoriaOferta): void {
    if (historial.accion === 'NUEVA_POSTULACION' || historial.accion === 'OFERTA_CREADA') {
      let datosParseados: any = {};
      try {
        datosParseados = typeof historial.valoresNuevos === 'string'
          ? JSON.parse(historial.valoresNuevos)
          : historial.valoresNuevos;
      } catch (e) {
        datosParseados = {};
      }

      const correoUsuario = historial.usuarioBd || this.ofertaSeleccionada?.usuarioBd || 'Correo Desconocido';

      this.auditoriaDetalleSeleccionada = {
        esResumen: true,
        tipoResumen: historial.accion === 'NUEVA_POSTULACION' ? 'POSTULACION' : 'CREACION',
        tituloOferta: historial.tituloOferta || this.ofertaSeleccionada?.tituloOferta || 'Oferta sin título',
        empresa: historial.empresa || this.ofertaSeleccionada?.empresa || 'Empresa sin nombre',
        fecha: historial.fechaHora,
        usuarioBd: correoUsuario,
        match: datosParseados?.porcentaje_match || 'N/A'
      };
      this.mostrarModalDetalles = true;

    } else {
      const auditoriaMapeada = {
        esResumen: false,
        tablaAfectada: 'ofertas.oferta_laboral',
        fechaHora: historial.fechaHora,
        usuarioBd: historial.usuarioBd || this.ofertaSeleccionada?.usuarioBd,
        camposModificados: {
          [historial.campoModificado || 'datos']: {
            anterior: historial.valoresAnteriores,
            nuevo: historial.valoresNuevos
          }
        }
      };
      this.abrirModalDetalles(auditoriaMapeada);
    }
  }

  abrirModalDetalles(auditoria: any): void {
    this.auditoriaDetalleSeleccionada = auditoria;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.auditoriaDetalleSeleccionada = null;
  }

  getCamposModificadosList(auditoria: any): Array<{nombre: string, anterior: any, nuevo: any}> {
    if (!auditoria || !auditoria.camposModificados) return [];

    let campos = auditoria.camposModificados;
    if (typeof campos === 'string') {
      try {
        campos = JSON.parse(campos);
      } catch (e) {
        return [];
      }
    }

    const lista = [];
    for (const key in campos) {
      if (Object.prototype.hasOwnProperty.call(campos, key)) {
        lista.push({
          nombre: key.replace(/_/g, ' ').toUpperCase(),
          anterior: this.formatearJSON(campos[key].anterior),
          nuevo: this.formatearJSON(campos[key].nuevo)
        });
      }
    }
    return lista;
  }

  formatearJSON(valor: any): any {
    if (valor === null || valor === undefined) return 'N/A';
    if (typeof valor === 'object') {
      return JSON.stringify(valor, null, 2);
    }
    if (typeof valor === 'string' && (valor.trim().startsWith('{') || valor.trim().startsWith('['))) {
      try {
        const parsed = JSON.parse(valor);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return valor;
      }
    }
    return valor;
  }

  getAccionOfertaClass(accion: string): string {
    if (!accion) return 'accion-otro';
    const acc = accion.toUpperCase();
    if (acc.includes('CREADA') || acc.includes('NUEVA') || acc.includes('APROBADA')) return 'accion-crear';
    if (acc.includes('ACTUALIZADA')) return 'accion-editar';
    if (acc.includes('ELIMINADA') || acc.includes('RECHAZADA') || acc.includes('RETIRADA')) return 'accion-eliminar';
    return 'accion-otro';
  }

  // ✅ CORREGIDO: Acepta string | undefined | null para evitar el error TS2345
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
