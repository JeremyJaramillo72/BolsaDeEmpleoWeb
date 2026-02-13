import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';


export interface EmpresaResumen {
  idUsuario: number;
  nombreEmpresa: string;
  ruc: string;
  correo: string;
  estado: string;
  sitioWeb?: string;
  descripcion: string;
  fechaRegistro: string;
  nombreCiudad: string;
}

@Component({
  selector: 'app-validar-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validar-empresa.html',
  styleUrls: ['./validar-empresa.css']
})
export class ValidarEmpresaComponent implements OnInit {


  filtroEstado: string = 'Pendiente';
  filtrosBusqueda: string = '';


  todasLasEmpresas: EmpresaResumen[] = [];


  empresaSeleccionada: EmpresaResumen | null = null;
  mostrarModal = false;


  accionValidacion: 'Aprobado' | 'Rechazado' | null = null;
  motivoRechazo = '';
  observaciones = '';


  cargando = false;
  mensajeExito = '';
  mensajeError = '';


  paginaActual = 1;
  itemsPorPagina = 10;


  estadisticas = {
    totalPendientes: 0,
    totalVerificadas: 0,
    totalRechazadas: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarEmpresas();
  }

  // ========== CARGA DE DATOS ==========
  cargarEmpresas(): void {
    this.cargando = true;


    this.adminService.getEmpresas('Todas').subscribe({
      next: (data) => {
        this.todasLasEmpresas = data;
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError('Error al conectar con el servidor.');
        console.error(err);
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas() {
    this.estadisticas.totalPendientes = this.todasLasEmpresas.filter(e => e.estado === 'Pendiente').length;
    this.estadisticas.totalVerificadas = this.todasLasEmpresas.filter(e => e.estado === 'Aprobado').length;
    this.estadisticas.totalRechazadas = this.todasLasEmpresas.filter(e => e.estado === 'Rechazado').length;
  }

  get empresasFiltradas(): EmpresaResumen[] {
    let lista = this.todasLasEmpresas.filter(e => {
      if (this.filtroEstado === 'Pendiente') return e.estado === 'Pendiente';
      if (this.filtroEstado === 'Verificada') return e.estado === 'Aprobado';
      if (this.filtroEstado === 'Rechazada') return e.estado === 'Rechazado';
      return true; // Caso 'Todas'
    });

    if (this.filtrosBusqueda.trim()) {
      const texto = this.filtrosBusqueda.toLowerCase();
      lista = lista.filter(emp =>
        emp.nombreEmpresa.toLowerCase().includes(texto) ||
        emp.ruc.includes(texto) ||
        emp.correo.toLowerCase().includes(texto)
      );
    }
    return lista;
  }

  get empresasPaginadas(): EmpresaResumen[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.empresasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.empresasFiltradas.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.paginaActual = 1;
    this.filtrosBusqueda = '';
  }

  abrirModalDetalle(empresa: EmpresaResumen): void {
    this.empresaSeleccionada = empresa;
    this.mostrarModal = true;
    this.accionValidacion = null;
    this.motivoRechazo = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
  }

  setAccion(accion: 'Aprobado' | 'Rechazado' | null) {
    this.accionValidacion = accion;
  }

  confirmarValidacion(): void {
    if (!this.empresaSeleccionada || !this.accionValidacion) return;

    this.cargando = true;

    this.adminService.cambiarEstadoEmpresa(
      this.empresaSeleccionada.idUsuario,
      this.accionValidacion
    ).subscribe({
      next: (res) => {
        this.mostrarExito(`Empresa ${this.accionValidacion} correctamente`);
        this.cargarEmpresas();
        this.cerrarModal();
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarExito(`Empresa ${this.accionValidacion} procesada`);
        this.cargarEmpresas();
        this.cerrarModal();
        this.cargando = false;
      }
    });
  }

  // ========== UTILIDADES ==========
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => this.mensajeError = '', 4000);
  }


  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'badge-warning'; // Ajusta a tus clases CSS
      case 'Aprobado': return 'badge-success';
      case 'Rechazado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }


  calcularDiasDesdeRegistro(fechaRegistro: string): number {
    if (!fechaRegistro) return 0;
    const hoy = new Date();
    const registro = new Date(fechaRegistro);
    const diferencia = hoy.getTime() - registro.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }
}
