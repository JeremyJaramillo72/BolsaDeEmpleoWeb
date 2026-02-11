import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface Filtros {
  fechaInicio: string;
  fechaFin: string;
  estado?: string;
  categoria?: string;
  empresa?: string;
  facultad?: string;
}

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-reportes.html',
  styleUrls: ['./gestion-reportes.css']
})
export class GestionReportesComponent implements OnInit {

  // Control de tabs
  tipoReporte: string = 'ofertas';

  // Filtros globales
  filtros: Filtros = {
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    categoria: '',
    empresa: '',
    facultad: ''
  };

  // Datos de reportes
  reporteOfertas: any[] = [];
  reportePostulaciones: any[] = [];
  reporteUsuarios: any[] = [];
  reporteEmpresas: any[] = [];
  reporteEstadisticas: any = null;

  // Catálogos para filtros
  categorias: any[] = [];
  empresas: any[] = [];
  facultades: any[] = [];
  estadosOferta: string[] = ['Activa', 'Pausada', 'Cerrada', 'En Revisión'];

  // Estados de UI
  cargando = false;
  mensajeError = '';
  mostrandoResultados = false;

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalItems = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarCatalogos();
    this.inicializarFechas();
  }

  // ========== INICIALIZACIÓN ==========
  inicializarFechas(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.filtros.fechaFin = this.formatearFecha(hoy);
    this.filtros.fechaInicio = this.formatearFecha(hace30Dias);
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  cargarCatalogos(): void {
    this.adminService.getCategoriasCatalogo().subscribe(data => {
      this.categorias = data;
    });



    this.adminService.getFacultadesCatalogo().subscribe(data => {
      this.facultades = data;
    });
  }

  // ========== CAMBIO DE TIPO DE REPORTE ==========
  cambiarTipoReporte(tipo: string): void {
    this.tipoReporte = tipo;
    this.limpiarResultados();
  }

  // ========== GENERACIÓN DE REPORTES ==========
  generarReporte(): void {
    if (!this.validarFiltros()) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    switch (this.tipoReporte) {
      case 'ofertas':
        this.generarReporteOfertas();
        break;
      case 'postulaciones':
        this.generarReportePostulaciones();
        break;
      case 'usuarios':
        this.generarReporteUsuarios();
        break;
      case 'empresas':
        this.generarReporteEmpresas();
        break;
      case 'estadisticas':
        this.generarReporteEstadisticas();
        break;
    }
  }

  generarReporteOfertas(): void {
    this.adminService.getReporteOfertas(this.filtros).subscribe({
      next: (data) => {
        this.reporteOfertas = data;
        this.totalItems = data.length;
        this.mostrandoResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al generar reporte de ofertas';
        this.cargando = false;
      }
    });
  }

  generarReportePostulaciones(): void {
    this.adminService.getReportePostulaciones(this.filtros).subscribe({
      next: (data) => {
        this.reportePostulaciones = data;
        this.totalItems = data.length;
        this.mostrandoResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al generar reporte de postulaciones';
        this.cargando = false;
      }
    });
  }

  generarReporteUsuarios(): void {
    this.adminService.getReporteUsuarios(this.filtros).subscribe({
      next: (data) => {
        this.reporteUsuarios = data;
        this.totalItems = data.length;
        this.mostrandoResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al generar reporte de usuarios';
        this.cargando = false;
      }
    });
  }

  generarReporteEmpresas(): void {
    this.adminService.getReporteEmpresas(this.filtros).subscribe({
      next: (data) => {
        this.reporteEmpresas = data;
        this.totalItems = data.length;
        this.mostrandoResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al generar reporte de empresas';
        this.cargando = false;
      }
    });
  }

  generarReporteEstadisticas(): void {
    this.adminService.getReporteEstadisticas(this.filtros).subscribe({
      next: (data) => {
        this.reporteEstadisticas = data;
        this.mostrandoResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al generar estadísticas';
        this.cargando = false;
      }
    });
  }

  // ========== EXPORTAR REPORTES ==========
  exportarExcel(): void {
    let datos: any[] = [];
    let nombreArchivo = '';

    switch (this.tipoReporte) {
      case 'ofertas':
        datos = this.reporteOfertas;
        nombreArchivo = 'reporte_ofertas';
        break;
      case 'postulaciones':
        datos = this.reportePostulaciones;
        nombreArchivo = 'reporte_postulaciones';
        break;
      case 'usuarios':
        datos = this.reporteUsuarios;
        nombreArchivo = 'reporte_usuarios';
        break;
      case 'empresas':
        datos = this.reporteEmpresas;
        nombreArchivo = 'reporte_empresas';
        break;
    }

    if (datos.length > 0) {
      this.adminService.exportarExcel(datos, nombreArchivo).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${nombreArchivo}_${new Date().getTime()}.xlsx`;
          link.click();
        },
        error: (err) => {
          this.mensajeError = 'Error al exportar a Excel';
        }
      });
    }
  }

  exportarPDF(): void {
    this.adminService.exportarPDF(this.tipoReporte, this.filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${this.tipoReporte}_${new Date().getTime()}.pdf`;
        link.click();
      },
      error: (err) => {
        this.mensajeError = 'Error al exportar a PDF';
      }
    });
  }

  // ========== VALIDACIONES Y UTILIDADES ==========
  validarFiltros(): boolean {
    if (!this.filtros.fechaInicio || !this.filtros.fechaFin) {
      this.mensajeError = 'Las fechas de inicio y fin son obligatorias';
      return false;
    }

    if (new Date(this.filtros.fechaInicio) > new Date(this.filtros.fechaFin)) {
      this.mensajeError = 'La fecha de inicio no puede ser mayor a la fecha fin';
      return false;
    }

    return true;
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      categoria: '',
      empresa: '',
      facultad: ''
    };
    this.inicializarFechas();
    this.limpiarResultados();
  }

  limpiarResultados(): void {
    this.mostrandoResultados = false;
    this.reporteOfertas = [];
    this.reportePostulaciones = [];
    this.reporteUsuarios = [];
    this.reporteEmpresas = [];
    this.reporteEstadisticas = null;
    this.mensajeError = '';
    this.paginaActual = 1;
  }

  // ========== PAGINACIÓN ==========
  get itemsPaginados(): any[] {
    let datos: any[] = [];

    switch (this.tipoReporte) {
      case 'ofertas':
        datos = this.reporteOfertas;
        break;
      case 'postulaciones':
        datos = this.reportePostulaciones;
        break;
      case 'usuarios':
        datos = this.reporteUsuarios;
        break;
      case 'empresas':
        datos = this.reporteEmpresas;
        break;
    }

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return datos.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalItems / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ========== UTILIDADES DE VISTA ==========
  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'Activa': return 'badge-activa';
      case 'Pausada': return 'badge-pausada';
      case 'Cerrada': return 'badge-cerrada';
      default: return 'badge-revision';
    }
  }
}
