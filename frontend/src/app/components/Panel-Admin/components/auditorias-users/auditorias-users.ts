import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  estado: string;
  fechaRegistro: string;
  ultimoAcceso?: string;
  totalAuditorias: number;
}

interface Auditoria {
  id: number;
  accion: string;
  modulo: string;
  descripcion: string;
  fechaHora: string;
  ipAddress?: string;
  navegador?: string;
  detalles?: any;
  tablaAfectada?: string;
}

// Interfaz opcional para tipar las sesiones (mejora la legibilidad)
interface Sesion {
  idSesion?: number;
  loginName: string;
  fechaInicio: string;
  fechaCierre?: string;
  ipAddress: string;
  navegador: string;
  accion: string;
  dispositivo?: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditorias-users.html',
  styleUrls: ['./auditorias-users.css']
})
export class AdminUsuariosComponent implements OnInit {

  // ========== VARIABLES EXISTENTES ==========
  // Lista de usuarios
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  // Filtros
  filtroRol: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  // Roles disponibles
  rolesDisponibles: string[] = [];
  estadosDisponibles: string[] = ['Activo', 'Inactivo', 'Bloqueado'];

  // Usuario seleccionado para auditorías
  usuarioSeleccionado: Usuario | null = null;
  auditorias: Auditoria[] = [];
  mostrarModalAuditorias = false;

  // Paginación - Tabla Principal
  paginaActual = 1;
  itemsPorPagina = 10;

  // Paginación - Auditorías
  paginaAuditorias = 1;
  itemsPorPaginaAuditorias = 8;

  // Estados de UI
  cargando = false;
  cargandoAuditorias = false;
  mensajeError = '';

  // Estadísticas
  estadisticas = {
    totalUsuarios: 0,
    usuariosActivos: 0,
    administradores: 0,
    empresas: 0,
    usuariosNormales: 0,
    registrosHoy: 0
  };

  // Ordenamiento
  columnaOrden: string = 'fechaRegistro';
  direccionOrden: 'asc' | 'desc' = 'desc';

  // ========== VARIABLES PARA TABS DE AUDITORÍAS (MODAL) ==========
  tabActivo: 'INSERT' | 'DELETE' | 'UPDATE' = 'INSERT';
  auditoriasFiltradas: Auditoria[] = [];

  // ========== NUEVAS VARIABLES PARA TABS PRINCIPALES (USUARIOS / SESIONES) ==========
  tabPrincipal: 'usuarios' | 'sesiones' = 'usuarios';

  sesiones: Sesion[] = [];
  sesionesFiltradas: Sesion[] = [];
  cargandoSesiones = false;
  filtroBusquedaSesiones = '';
  filtroAccionSesion = '';
  paginaSesiones = 1;
  itemsPorPaginaSesiones = 10;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarEstadisticas();
    this.cargarSesiones(); // <-- NUEVO: cargar sesiones al iniciar
  }

  // ========== CARGA DE DATOS ==========
  cargarUsuarios(): void {
    this.cargando = true;

    this.adminService.obtenerTodosUsuarios().subscribe({
      next: (data) => {
        // Mapear los datos del backend al formato del componente
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

        // Extraer roles únicos para los filtros
        const rolesUnicos = [...new Set(this.usuarios.map(u => u.rol))];
        this.rolesDisponibles = rolesUnicos.filter(rol => rol !== 'Sin Rol');

        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mensajeError = 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.adminService.getEstadisticasUsuarios().subscribe({
      next: (data) => {
        this.estadisticas = {
          totalUsuarios: data.totalUsuarios || 0,
          usuariosActivos: data.usuariosActivos || 0,
          administradores: data.administradores || 0,
          empresas: data.empresas || 0,
          usuariosNormales: data.usuariosNormales || 0,
          registrosHoy: data.registrosHoy || 0
        };
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        // Calcular estadísticas localmente si falla el backend
        this.calcularEstadisticasLocales();
      }
    });
  }

  calcularEstadisticasLocales(): void {
    this.estadisticas.totalUsuarios = this.usuarios.length;
    this.estadisticas.usuariosActivos = this.usuarios.filter(u => u.estado === 'Activo').length;
    this.estadisticas.administradores = this.usuarios.filter(u =>
      u.rol.toLowerCase().includes('admin') || u.rol.toLowerCase().includes('moderador')
    ).length;
    this.estadisticas.empresas = this.usuarios.filter(u =>
      u.rol.toLowerCase().includes('empresa')
    ).length;
    this.estadisticas.usuariosNormales = this.usuarios.filter(u =>
      u.rol.toLowerCase().includes('usuario') || u.rol.toLowerCase().includes('postulante')
    ).length;

    const hoy = new Date().toISOString().split('T')[0];
    this.estadisticas.registrosHoy = this.usuarios.filter(u =>
      u.fechaRegistro && u.fechaRegistro.startsWith(hoy)
    ).length;
  }

  // ========== FILTRADO Y BÚSQUEDA (USUARIOS) ==========
  aplicarFiltros(): void {
    let resultado = [...this.usuarios];

    // Filtro por rol
    if (this.filtroRol) {
      resultado = resultado.filter(u => u.rol === this.filtroRol);
    }

    // Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(u => u.estado === this.filtroEstado);
    }

    // Búsqueda por texto
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombreCompleto.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda) ||
        u.rol.toLowerCase().includes(busqueda)
      );
    }

    // Aplicar ordenamiento
    resultado = this.ordenarUsuarios(resultado);

    this.usuariosFiltrados = resultado;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroRol = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  // ========== ORDENAMIENTO ==========
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
    return usuarios.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch(this.columnaOrden) {
        case 'nombre':
          valorA = a.nombreCompleto.toLowerCase();
          valorB = b.nombreCompleto.toLowerCase();
          break;
        case 'email':
          valorA = a.email.toLowerCase();
          valorB = b.email.toLowerCase();
          break;
        case 'rol':
          valorA = a.rol.toLowerCase();
          valorB = b.rol.toLowerCase();
          break;
        case 'estado':
          valorA = a.estado.toLowerCase();
          valorB = b.estado.toLowerCase();
          break;
        case 'fechaRegistro':
          valorA = new Date(a.fechaRegistro).getTime();
          valorB = new Date(b.fechaRegistro).getTime();
          break;
        case 'auditorias':
          valorA = a.totalAuditorias;
          valorB = b.totalAuditorias;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return this.direccionOrden === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.direccionOrden === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // ========== PAGINACIÓN - TABLA PRINCIPAL ==========
  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get rangoMostrado(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.usuariosFiltrados.length);
    return `${inicio}-${fin} de ${this.usuariosFiltrados.length}`;
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
        // Mapear las auditorías del backend
        this.auditorias = data.map((auditoria: any) => ({
          id: auditoria.idAuditoria,
          accion: auditoria.accion,
          modulo: auditoria.tablaAfectada || 'Sin tabla',
          tablaAfectada: auditoria.tablaAfectada || 'Sin tabla',
          descripcion: auditoria.descripcion,
          fechaHora: auditoria.fechaHora,
          ipAddress: auditoria.ipAddress,
          navegador: auditoria.navegador,
          detalles: auditoria.detalles
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

  // ========== MÉTODOS PARA TABS DE AUDITORÍAS ==========
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

  // ========== PAGINACIÓN - AUDITORÍAS ==========
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

  // ========== EXPORTAR USUARIOS ==========
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

  // ========== UTILIDADES GENERALES ==========
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

  // ========== NUEVOS MÉTODOS PARA EL TAB DE SESIONES ==========

  /**
   * Cambia entre los tabs principales (Usuarios / Sesiones)
   */
  cambiarTabPrincipal(tab: 'usuarios' | 'sesiones'): void {
    this.tabPrincipal = tab;
  }

  /**
   * Carga la lista de sesiones desde el servicio
   */
  cargarSesiones(): void {
    this.cargandoSesiones = true;
    this.adminService.getSesiones().subscribe({
      next: (data: Sesion[]) => {
        this.sesiones = data;
        this.aplicarFiltrosSesiones();
        this.cargandoSesiones = false;
      },
      error: (err) => {
        console.error('Error al cargar sesiones:', err);
        this.cargandoSesiones = false;
        this.mensajeError = 'Error al cargar sesiones';
      }
    });
  }

  /**
   * Aplica los filtros de búsqueda y acción a las sesiones
   */
  aplicarFiltrosSesiones(): void {
    let resultado = [...this.sesiones];

    // Filtro por acción
    if (this.filtroAccionSesion) {
      resultado = resultado.filter(s => s.accion === this.filtroAccionSesion);
    }

    // Filtro por búsqueda de texto
    if (this.filtroBusquedaSesiones.trim()) {
      const busqueda = this.filtroBusquedaSesiones.toLowerCase();
      resultado = resultado.filter(s =>
        (s.loginName && s.loginName.toLowerCase().includes(busqueda)) ||
        (s.ipAddress && s.ipAddress.toLowerCase().includes(busqueda)) ||
        (s.accion && s.accion.toLowerCase().includes(busqueda))
      );
    }

    this.sesionesFiltradas = resultado;
    this.paginaSesiones = 1; // Reiniciar a la primera página
  }

  /**
   * Limpia los filtros de sesiones
   */
  limpiarFiltrosSesiones(): void {
    this.filtroBusquedaSesiones = '';
    this.filtroAccionSesion = '';
    this.aplicarFiltrosSesiones();
  }

  /**
   * Getter para obtener las sesiones de la página actual
   */
  get sesionesPaginadas(): Sesion[] {
    const inicio = (this.paginaSesiones - 1) * this.itemsPorPaginaSesiones;
    const fin = inicio + this.itemsPorPaginaSesiones;
    return this.sesionesFiltradas.slice(inicio, fin);
  }

  /**
   * Getter para el total de páginas de sesiones
   */
  get totalPaginasSesiones(): number {
    return Math.ceil(this.sesionesFiltradas.length / this.itemsPorPaginaSesiones);
  }

  /**
   * Cambia la página actual en la tabla de sesiones
   */
  cambiarPaginaSesiones(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasSesiones) {
      this.paginaSesiones = pagina;
    }
  }

  /**
   * Devuelve la clase CSS correspondiente al estado de la sesión
   */
  getAccionSesionClass(accion: string): string {
    switch(accion?.toUpperCase()) {
      case 'ACTIVA':   return 'sesion-activa';
      case 'CERRADA':  return 'sesion-cerrada';
      default:         return 'sesion-inactiva';
    }
  }

  /**
   * Exporta las sesiones filtradas a Excel
   */
  exportarSesionesExcel(): void {
    this.adminService.exportarSesionesExcel(this.sesionesFiltradas).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sesiones_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar sesiones:', err);
        this.mensajeError = 'Error al exportar sesiones';
      }
    });
  }
}
