import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface EmpresaPendiente {
  id: number;
  nombreEmpresa: string;
  ruc: string;
  sector: string;
  email: string;
  telefono: string;
  direccion: string;
  sitioWeb?: string;
  representanteLegal: string;
  documentoVerificacion?: string;
  fechaRegistro: string;
  estado: string;
  motivoRechazo?: string;
}

@Component({
  selector: 'app-validar-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validar-empresa.html',
  styleUrls: ['./validar-empresa.css']
})
export class ValidarEmpresaComponent implements OnInit {

  // Filtro de estado
  filtroEstado: string = 'Pendiente';
  filtrosBusqueda: string = '';

  // Listas de empresas
  empresasPendientes: EmpresaPendiente[] = [];
  empresasVerificadas: EmpresaPendiente[] = [];
  empresasRechazadas: EmpresaPendiente[] = [];

  // Empresa seleccionada para detalle/validación
  empresaSeleccionada: EmpresaPendiente | null = null;
  mostrarModal = false;

  // Formulario de validación
  accionValidacion: 'aprobar' | 'rechazar' | null = null;
  motivoRechazo = '';
  observaciones = '';

  // Estados de UI
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;

  // Estadísticas
  estadisticas = {
    totalPendientes: 0,
    totalVerificadas: 0,
    totalRechazadas: 0,
    pendientesHoy: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarEmpresas();
    this.cargarEstadisticas();
  }

  // ========== CARGA DE DATOS ==========
  cargarEmpresas(): void {
    this.cargando = true;

    this.adminService.getEmpresasPorEstado('Pendiente').subscribe({
      next: (data) => {
        this.empresasPendientes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError('Error al cargar empresas pendientes');
        this.cargando = false;
      }
    });

    this.adminService.getEmpresasPorEstado('Verificada').subscribe({
      next: (data) => {
        this.empresasVerificadas = data;
      },
      error: (err) => console.error('Error al cargar empresas verificadas')
    });

    this.adminService.getEmpresasPorEstado('Rechazada').subscribe({
      next: (data) => {
        this.empresasRechazadas = data;
      },
      error: (err) => console.error('Error al cargar empresas rechazadas')
    });
  }

  cargarEstadisticas(): void {
    this.adminService.getEstadisticasEmpresas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: (err) => console.error('Error al cargar estadísticas')
    });
  }

  // ========== FILTRADO Y BÚSQUEDA ==========
  get empresasFiltradas(): EmpresaPendiente[] {
    let empresas: EmpresaPendiente[] = [];

    switch (this.filtroEstado) {
      case 'Pendiente':
        empresas = this.empresasPendientes;
        break;
      case 'Verificada':
        empresas = this.empresasVerificadas;
        break;
      case 'Rechazada':
        empresas = this.empresasRechazadas;
        break;
      default:
        empresas = [...this.empresasPendientes, ...this.empresasVerificadas, ...this.empresasRechazadas];
    }

    // Aplicar búsqueda
    if (this.filtrosBusqueda.trim()) {
      const busqueda = this.filtrosBusqueda.toLowerCase();
      empresas = empresas.filter(emp =>
        emp.nombreEmpresa.toLowerCase().includes(busqueda) ||
        emp.ruc.includes(busqueda) ||
        emp.sector.toLowerCase().includes(busqueda)
      );
    }

    return empresas;
  }

  get empresasPaginadas(): EmpresaPendiente[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.empresasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.empresasFiltradas.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.paginaActual = 1;
  }

  // ========== MODAL DE DETALLE ==========
  abrirModalDetalle(empresa: EmpresaPendiente): void {
    this.empresaSeleccionada = empresa;
    this.mostrarModal = true;
    this.accionValidacion = null;
    this.motivoRechazo = '';
    this.observaciones = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
    this.accionValidacion = null;
    this.motivoRechazo = '';
    this.observaciones = '';
  }

  // ========== ACCIONES DE VALIDACIÓN ==========
  prepararAprobacion(): void {
    this.accionValidacion = 'aprobar';
  }

  prepararRechazo(): void {
    this.accionValidacion = 'rechazar';
  }

  confirmarValidacion(): void {
    if (!this.empresaSeleccionada) return;

    if (this.accionValidacion === 'rechazar' && !this.motivoRechazo.trim()) {
      this.mostrarError('El motivo del rechazo es obligatorio');
      return;
    }

    this.cargando = true;

    const datosValidacion = {
      idEmpresa: this.empresaSeleccionada.id,
      accion: this.accionValidacion,
      motivoRechazo: this.motivoRechazo,
      observaciones: this.observaciones
    };

    if (this.accionValidacion === 'aprobar') {
      this.aprobarEmpresa(datosValidacion);
    } else {
      this.rechazarEmpresa(datosValidacion);
    }
  }

  aprobarEmpresa(datos: any): void {
    this.adminService.aprobarEmpresa(datos).subscribe({
      next: (response) => {
        this.mostrarExito('Empresa aprobada exitosamente');
        this.cargarEmpresas();
        this.cargarEstadisticas();
        this.cerrarModal();
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError('Error al aprobar empresa');
        this.cargando = false;
      }
    });
  }

  rechazarEmpresa(datos: any): void {
    this.adminService.rechazarEmpresa(datos).subscribe({
      next: (response) => {
        this.mostrarExito('Empresa rechazada exitosamente');
        this.cargarEmpresas();
        this.cargarEstadisticas();
        this.cerrarModal();
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError('Error al rechazar empresa');
        this.cargando = false;
      }
    });
  }

  // ========== DESCARGAR DOCUMENTO ==========
  descargarDocumento(empresa: EmpresaPendiente): void {
    if (empresa.documentoVerificacion) {
      this.adminService.descargarDocumentoEmpresa(empresa.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `documento_${empresa.nombreEmpresa}_${empresa.id}.pdf`;
          link.click();
        },
        error: (err) => {
          this.mostrarError('Error al descargar documento');
        }
      });
    }
  }

  // ========== UTILIDADES ==========
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 4000);
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'badge-pendiente';
      case 'Verificada': return 'badge-verificada';
      case 'Rechazada': return 'badge-rechazada';
      default: return '';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calcularDiasDesdeRegistro(fechaRegistro: string): number {
    const hoy = new Date();
    const registro = new Date(fechaRegistro);
    const diferencia = hoy.getTime() - registro.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }
}
