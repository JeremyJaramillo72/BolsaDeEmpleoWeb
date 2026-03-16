import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  tipoModalDetalle: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE';

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

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
      error: () => {
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

  getRolClass(rol: string): string {
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('admin') || rolLower.includes('administrador')) return 'rol-admin';
    if (rolLower.includes('empresa')) return 'rol-empresa';
    if (rolLower.includes('moderador')) return 'rol-moderador';
    return 'rol-usuario';
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      case 'bloqueado': return 'estado-bloqueado';
      default: return '';
    }
  }

  getAccionClass(accion: string): string {
    const accionLower = accion.toLowerCase();
    if (accionLower.includes('crear') || accionLower.includes('registro')) return 'accion-crear';
    if (accionLower.includes('actualizar') || accionLower.includes('editar')) return 'accion-editar';
    if (accionLower.includes('eliminar') || accionLower.includes('borrar')) return 'accion-eliminar';
    if (accionLower.includes('login') || accionLower.includes('acceso')) return 'accion-acceso';
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
        // Opcional: Esto te muestra todo el arreglo de golpe por si lo quieres ver
        console.log('Toda la data del backend:', data);

        this.auditorias = data.map((auditoria: any) => {

          // ✅ Aquí está tu log para ver cada registro individualmente
          if (auditoria.accion && auditoria.accion.toUpperCase().includes('INSERT')) {
            console.log('👉 ESTE ES UN INSERT:', auditoria);
          }

          return {
            id: auditoria.idAuditoria,
            accion: auditoria.accion,
            modulo: auditoria.tablaAfectada || 'Sin tabla',
            tablaAfectada: auditoria.tablaAfectada || 'Sin tabla',
            descripcion: auditoria.descripcion,
            fechaHora: auditoria.fechaHora,
            ipAddress: auditoria.ipAddress,
            navegador: auditoria.navegador,
            detalles: auditoria.detalles,
            camposModificados: auditoria.camposModificados || auditoria.campos_modificados || null,
            // ✅ AQUÍ ESTÁ EL FIX: Agregamos auditoria.datosNuevos al principio
            valoresNuevos: auditoria.datosNuevos || auditoria.valoresNuevos || auditoria.detalles || null,
            // ✅ AGREGAMOS ESTA LÍNEA PARA EL DELETE:
            valoresAnteriores: auditoria.datosAnteriores || auditoria.valoresAnteriores || null
          };
        });

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
    return this.auditorias.filter(a => a.accion.toUpperCase().includes(tipo)).length;
  }

  get auditoriasPaginadas(): Auditoria[] {
    const inicio = (this.paginaAuditorias - 1) * this.itemsPorPaginaAuditorias;
    return this.auditoriasFiltradas.slice(inicio, inicio + this.itemsPorPaginaAuditorias);
  }

  get totalPaginasAuditorias(): number {
    return Math.ceil(this.auditoriasFiltradas.length / this.itemsPorPaginaAuditorias);
  }

  cambiarPaginaAuditorias(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasAuditorias) this.paginaAuditorias = pagina;
  }

  exportarUsuarios(): void {
    this.adminService.exportarUsuariosExcel(this.usuariosFiltrados).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_${new Date().getTime()}.xlsx`;
        link.click();
      },
      error: () => { this.mensajeError = 'Error al exportar usuarios'; }
    });
  }

  exportarAuditorias(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminService.exportarAuditoriasExcel(this.usuarioSeleccionado.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditorias_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.xlsx`;
        link.click();
      },
      error: () => { this.mensajeError = 'Error al exportar auditorías'; }
    });
  }

  exportarTabPdf(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminService.exportarAuditoriasPdf(this.usuarioSeleccionado.id, this.tabActivo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditorias_${this.tabActivo}_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { this.mensajeError = 'Error al exportar PDF'; }
    });
  }

  exportarTabExcel(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminService.exportarAuditoriasExcelPorTipo(this.usuarioSeleccionado.id, this.tabActivo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditorias_${this.tabActivo}_${this.usuarioSeleccionado?.nombreCompleto}_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { this.mensajeError = 'Error al exportar Excel'; }
    });
  }

  // ========== MODAL DETALLES ==========
  abrirModalDetalles(auditoria: any): void {
    this.auditoriaDetalleSeleccionada = auditoria;
    const accion = (auditoria.accion || '').toUpperCase();
    if (accion.includes('INSERT')) this.tipoModalDetalle = 'INSERT';
    else if (accion.includes('DELETE')) this.tipoModalDetalle = 'DELETE';
    else this.tipoModalDetalle = 'UPDATE';
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.auditoriaDetalleSeleccionada = null;
  }

  // ✅ Para UPDATE/DELETE: lista de campos con anterior y nuevo
  getCamposModificadosList(auditoria: any): Array<{nombre: string, anterior: any, nuevo: any}> {
    if (!auditoria || !auditoria.camposModificados) return [];
    let campos = auditoria.camposModificados;
    if (typeof campos === 'string') {
      try { campos = JSON.parse(campos); } catch { return []; }
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

  // ✅ NUEVO: Para INSERT — lista de campos insertados (solo valores nuevos)
  getInsertDataList(auditoria: any): Array<{campo: string, valor: any}> {
    if (!auditoria) return [];

    // Intentamos obtener los datos de distintas fuentes posibles del backend
    let datos = auditoria.valoresNuevos || auditoria.camposModificados || auditoria.detalles;
    if (!datos) return [];

    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos); } catch { return []; }
    }

    // Si el objeto tiene estructura { campo: { nuevo: valor } } (como UPDATE)
    const primeraKey = Object.keys(datos)[0];
    const esEstructuraUpdate = primeraKey && datos[primeraKey] !== null
      && typeof datos[primeraKey] === 'object'
      && ('nuevo' in datos[primeraKey] || 'anterior' in datos[primeraKey]);

    const lista: Array<{campo: string, valor: any}> = [];

    if (esEstructuraUpdate) {
      for (const key in datos) {
        if (Object.prototype.hasOwnProperty.call(datos, key)) {
          lista.push({
            campo: key.replace(/_/g, ' ').toUpperCase(),
            valor: datos[key].nuevo ?? datos[key].anterior ?? 'N/A'
          });
        }
      }
    } else {
      // Estructura plana { campo: valor }
      for (const key in datos) {
        if (Object.prototype.hasOwnProperty.call(datos, key)) {
          const val = datos[key];
          lista.push({
            campo: key.replace(/_/g, ' ').toUpperCase(),
            valor: typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : (val ?? 'N/A')
          });
        }
      }
    }
    return lista;
  }

  // ✅ Helper para saber si un INSERT tiene datos para mostrar
  insertTieneDetalles(audit: any): boolean {
    return !!(audit.valoresNuevos || audit.camposModificados || audit.detalles);
  }

  // ✅ Helper para saber si un DELETE tiene datos para mostrar
  deleteTieneDetalles(audit: any): boolean {
    return !!(audit.valoresAnteriores || audit.camposModificados || audit.detalles);
  }

  // ✅ Para DELETE — lista de campos eliminados (solo valores anteriores)
  getDeleteDataList(auditoria: any): Array<{campo: string, valor: any}> {
    if (!auditoria) return [];

    let datos = auditoria.valoresAnteriores || auditoria.camposModificados || auditoria.detalles;
    if (!datos) return [];

    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos); } catch { return []; }
    }

    const primeraKey = Object.keys(datos)[0];
    const esEstructuraUpdate = primeraKey && datos[primeraKey] !== null
      && typeof datos[primeraKey] === 'object'
      && ('anterior' in datos[primeraKey] || 'nuevo' in datos[primeraKey]);

    const lista: Array<{campo: string, valor: any}> = [];

    if (esEstructuraUpdate) {
      for (const key in datos) {
        if (Object.prototype.hasOwnProperty.call(datos, key)) {
          lista.push({
            campo: key.replace(/_/g, ' ').toUpperCase(),
            valor: datos[key].anterior ?? 'N/A'
          });
        }
      }
    } else {
      for (const key in datos) {
        if (Object.prototype.hasOwnProperty.call(datos, key)) {
          const val = datos[key];
          lista.push({
            campo: key.replace(/_/g, ' ').toUpperCase(),
            valor: typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : (val ?? 'N/A')
          });
        }
      }
    }
    return lista;
  }


}
