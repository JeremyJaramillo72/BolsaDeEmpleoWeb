import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Ajusta esta ruta si es necesario para llegar a tu servicio
import { AdminService } from '../../../services/admin.service';

export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  estado: string;
  fechaRegistro: string;
  ultimoAcceso?: string;
  totalAuditorias: number;
}

export interface Auditoria {
  id: number;
  accion: string;
  modulo: string;
  descripcion: string;
  fechaHora: string;
  ipAddress?: string;
  navegador?: string;
  detalles?: any;
  tablaAfectada?: string;
  camposModificados?: any;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  filtroRol: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';
  rolesDisponibles: string[] = [];
  estadosDisponibles: string[] = ['Activo', 'Inactivo', 'Bloqueado'];

  columnaOrden: string = 'fechaRegistro';
  direccionOrden: 'asc' | 'desc' = 'desc';

  paginaActual = 1;
  itemsPorPagina = 10;
  cargando = false;
  mensajeError = '';

  // Variables para Modales de Auditoría
  usuarioSeleccionado: Usuario | null = null;
  auditorias: Auditoria[] = [];
  auditoriasFiltradas: Auditoria[] = [];
  mostrarModalAuditorias = false;
  cargandoAuditorias = false;
  tabActivo: 'INSERT' | 'DELETE' | 'UPDATE' = 'INSERT';
  paginaAuditorias = 1;
  itemsPorPaginaAuditorias = 8;
  mostrarModalDetalles = false;
  auditoriaDetalleSeleccionada: any = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ========== CARGA Y FILTROS PRINCIPALES ==========
  cargarUsuarios(): void {
    this.cargando = true;
    this.adminService.obtenerTodosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.map((usuario: any) => ({
          id: usuario.idUsuario,
          nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
          email: usuario.correo,
          rol: usuario.rol ? usuario.rol.nombreRol : 'Sin Rol',
          estado: usuario.estadoValidacion || 'Activo',
          fechaRegistro: usuario.fechaRegistro,
          ultimoAcceso: usuario.ultimoAcceso,
          totalAuditorias: usuario.totalAuditorias || 0
        }));

        const rolesUnicos = [...new Set(this.usuarios.map(u => u.rol))];
        this.rolesDisponibles = rolesUnicos.filter(rol => rol !== 'Sin Rol');

        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.usuarios];
    if (this.filtroRol) resultado = resultado.filter(u => u.rol === this.filtroRol);
    if (this.filtroEstado) resultado = resultado.filter(u => u.estado === this.filtroEstado);
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombreCompleto.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda) ||
        u.rol.toLowerCase().includes(busqueda)
      );
    }
    this.usuariosFiltrados = this.ordenarUsuarios(resultado);
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroRol = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.aplicarFiltros();
  }

  ordenarUsuarios(usuarios: Usuario[]): Usuario[] {
    return usuarios.sort((a: any, b: any) => {
      let valorA = a[this.columnaOrden]?.toString().toLowerCase() || '';
      let valorB = b[this.columnaOrden]?.toString().toLowerCase() || '';
      if (this.columnaOrden === 'fechaRegistro') {
        valorA = new Date(a.fechaRegistro).getTime();
        valorB = new Date(b.fechaRegistro).getTime();
      }
      if (valorA < valorB) return this.direccionOrden === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  get rangoMostrado(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.usuariosFiltrados.length);
    return `${inicio}-${fin} de ${this.usuariosFiltrados.length}`;
  }

  // ========== UTILIDADES DE UI ==========
  getRolClass(rol: string): string {
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('admin') || rolLower.includes('administrador')) {
      return 'rol-admin';
    } else if (rolLower.includes('empresa')) {
      return 'rol-empresa';
    } else if (rolLower.includes('moderador')) {
      return 'rol-moderador';
    }
    return 'rol-usuario';
  }

  getEstadoClass(estado: string): string {
    switch(estado.toLowerCase()) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      case 'bloqueado': return 'estado-bloqueado';
      default: return '';
    }
  }

  getAccionClass(accion: string): string {
    const accionLower = accion.toLowerCase();
    if (accionLower.includes('crear') || accionLower.includes('registro')) {
      return 'accion-crear';
    } else if (accionLower.includes('actualizar') || accionLower.includes('editar')) {
      return 'accion-editar';
    } else if (accionLower.includes('eliminar') || accionLower.includes('borrar')) {
      return 'accion-eliminar';
    } else if (accionLower.includes('login') || accionLower.includes('acceso')) {
      return 'accion-acceso';
    }
    return 'accion-otro';
  }

  formatearFechaHora(fecha: string | null | undefined): string {
    if (!fecha) {
      return '—';
    }
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ========== MODAL DE AUDITORÍAS ==========
  verAuditorias(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalAuditorias = true;
    this.paginaAuditorias = 1;
    this.tabActivo = 'INSERT';
    this.cargarAuditorias(usuario.id);
  }

  cargarAuditorias(idUsuario: number): void {
    this.cargandoAuditorias = true;
    this.adminService.getAuditoriasUsuario(idUsuario).subscribe({
      next: (data) => {
        this.auditorias = data.map((auditoria: any) => ({
          id: auditoria.idAuditoria,
          accion: auditoria.accion,
          modulo: auditoria.tablaAfectada || 'Sin tabla',
          tablaAfectada: auditoria.tablaAfectada || 'Sin tabla',
          descripcion: auditoria.descripcion,
          fechaHora: auditoria.fechaHora,
          ipAddress: auditoria.ipAddress,
          navegador: auditoria.navegador,
          detalles: auditoria.detalles,
          camposModificados: auditoria.camposModificados || auditoria.campos_modificados || null
        }));

        this.filtrarAuditoriasPorTab();
        this.cargandoAuditorias = false;
      },
      error: (err) => {
        console.error('Error al cargar auditorías:', err);
        this.mensajeError = 'Error al cargar auditorías';
        this.auditorias = [];
        this.auditoriasFiltradas = [];
        this.cargandoAuditorias = false;
      }
    });
  }

  cerrarModalAuditorias(): void {
    this.mostrarModalAuditorias = false;
    this.usuarioSeleccionado = null;
    this.auditorias = [];
  }

  cambiarTab(tab: 'INSERT' | 'DELETE' | 'UPDATE'): void {
    this.tabActivo = tab;
    this.paginaAuditorias = 1;
    this.filtrarAuditoriasPorTab();
  }

  filtrarAuditoriasPorTab(): void {
    this.auditoriasFiltradas = this.auditorias.filter(a =>
      a.accion.toUpperCase().includes(this.tabActivo)
    );
  }

  contarPorTipo(tipo: string): number {
    return this.auditorias.filter(a =>
      a.accion.toUpperCase().includes(tipo)
    ).length;
  }

  get auditoriasPaginadas(): Auditoria[] {
    const inicio = (this.paginaAuditorias - 1) * this.itemsPorPaginaAuditorias;
    const fin = inicio + this.itemsPorPaginaAuditorias;
    return this.auditoriasFiltradas.slice(inicio, fin);
  }

  get totalPaginasAuditorias(): number {
    return Math.ceil(this.auditoriasFiltradas.length / this.itemsPorPaginaAuditorias);
  }

  cambiarPaginaAuditorias(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasAuditorias) {
      this.paginaAuditorias = pagina;
    }
  }

  // ========== EXPORTACIONES ==========
  exportarUsuarios(): void {
    this.adminService.exportarUsuariosExcel(this.usuariosFiltrados).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_${new Date().getTime()}.xlsx`;
        link.click();
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        this.mensajeError = 'Error al exportar usuarios';
      }
    });
  }

  exportarAuditorias(): void {
    if (this.usuarioSeleccionado) {
      this.adminService.exportarAuditoriasExcel(this.usuarioSeleccionado.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `auditorias_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.xlsx`;
          link.click();
        },
        error: (err) => {
          console.error('Error al exportar:', err);
          this.mensajeError = 'Error al exportar auditorías';
        }
      });
    }
  }

  exportarTabPdf(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminService.exportarAuditoriasPdf(
      this.usuarioSeleccionado.id,
      this.tabActivo
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditorias_${this.tabActivo}_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar PDF:', err);
        this.mensajeError = 'Error al exportar PDF';
      }
    });
  }

  exportarTabExcel(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminService.exportarAuditoriasExcelPorTipo(
      this.usuarioSeleccionado.id,
      this.tabActivo
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditorias_${this.tabActivo}_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar Excel:', err);
        this.mensajeError = 'Error al exportar Excel';
      }
    });
  }

  // ========== MODAL DE DETALLES ==========
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
          anterior: campos[key].anterior ?? 'N/A',
          nuevo: campos[key].nuevo ?? 'N/A'
        });
      }
    }
    return lista;
  }
}
