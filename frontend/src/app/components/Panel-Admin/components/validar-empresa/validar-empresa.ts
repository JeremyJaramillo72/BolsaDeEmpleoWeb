import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';


// 1. Interfaz EXACTA a lo que envía el Backend (Java)
export interface EmpresaResumen {
  idUsuario: number;      // Antes era 'id'
  nombreEmpresa: string;
  ruc: string;
  correo: string;         // Antes era 'email'
  estado: string;         // 'Pendiente', 'Aprobado', 'Rechazado'
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

  // Filtro de estado (Pestaña actual)
  filtroEstado: string = 'Pendiente';
  filtrosBusqueda: string = '';

  // LISTA MAESTRA (Aquí guardamos todo lo que llega de la BD)
  todasLasEmpresas: EmpresaResumen[] = [];

  // Empresa seleccionada
  empresaSeleccionada: EmpresaResumen | null = null;
  mostrarModal = false;

  // Lógica de validación
  accionValidacion: 'Aprobado' | 'Rechazado' | null = null;
  motivoRechazo = '';
  observaciones = ''; // (Opcional, si tu BD no lo tiene, no se guardará)

  // Estados UI
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
    totalRechazadas: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarEmpresas();
  }

  // ========== CARGA DE DATOS ==========
  cargarEmpresas(): void {
    this.cargando = true;

    // Pedimos 'Todas' al backend para llenar las listas y contadores de una vez
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

  // ========== FILTRADO Y BÚSQUEDA ==========
  get empresasFiltradas(): EmpresaResumen[] {
    // 1. Primero filtramos por la Pestaña (Pendiente, Verificada...)
    let lista = this.todasLasEmpresas.filter(e => {
      if (this.filtroEstado === 'Pendiente') return e.estado === 'Pendiente';
      if (this.filtroEstado === 'Verificada') return e.estado === 'Aprobado'; // Ojo: BD dice Aprobado
      if (this.filtroEstado === 'Rechazada') return e.estado === 'Rechazado';
      return true; // Caso 'Todas'
    });

    // 2. Luego aplicamos la búsqueda por texto
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

  // Paginación sobre la lista ya filtrada
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
    this.filtrosBusqueda = ''; // Limpiamos búsqueda al cambiar de pestaña
  }

  // ========== MODALES Y ACCIONES ==========
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

  // Prepara la acción cuando das click en los botones del modal
  setAccion(accion: 'Aprobado' | 'Rechazado' | null) {
    this.accionValidacion = accion;
  }

  confirmarValidacion(): void {
    if (!this.empresaSeleccionada || !this.accionValidacion) return;

    this.cargando = true;

    // Llamamos al servicio unificado
    this.adminService.cambiarEstadoEmpresa(
      this.empresaSeleccionada.idUsuario, // Usamos idUsuario
      this.accionValidacion               // Enviamos "Aprobado" o "Rechazado"
    ).subscribe({
      next: (res) => {
        this.mostrarExito(`Empresa ${this.accionValidacion} correctamente`);
        this.cargarEmpresas(); // Recargamos la lista
        this.cerrarModal();
      },
      error: (err) => {
        this.mostrarError('Error al procesar la solicitud');
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

  // Clase CSS para las etiquetas
  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'badge-warning'; // Ajusta a tus clases CSS
      case 'Aprobado': return 'badge-success';
      case 'Rechazado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Calculo de días (Asegurándonos de que la fecha existe)
  calcularDiasDesdeRegistro(fechaRegistro: string): number {
    if (!fechaRegistro) return 0;
    const hoy = new Date();
    const registro = new Date(fechaRegistro);
    const diferencia = hoy.getTime() - registro.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }
}
