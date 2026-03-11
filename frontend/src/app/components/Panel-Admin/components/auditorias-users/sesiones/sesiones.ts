import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Ajusta la ruta a tu servicio si marca error
import { AdminService } from '../../../services/admin.service';

export interface Sesion {
  idSesion?: number;
  loginName: string;
  fechaInicio: string;
  fechaCierre?: string;
  ipAddress: string;
  navegador: string;
  accion: string;
  dispositivo?: string;
  estadoValidacion?: string;
}

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones.html',
  styleUrls: ['./sesiones.css']
})
export class SesionesComponent implements OnInit {
  sesiones: Sesion[] = [];
  sesionesFiltradas: Sesion[] = [];
  cargandoSesiones = false;
  mensajeError = '';

  filtroBusquedaSesiones = '';
  filtroAccionSesion = '';

  paginaSesiones = 1;
  itemsPorPaginaSesiones = 10;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarSesiones();
  }

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

  aplicarFiltrosSesiones(): void {
    let resultado = [...this.sesiones];
    if (this.filtroAccionSesion) {
      resultado = resultado.filter(s => s.accion === this.filtroAccionSesion);
    }
    if (this.filtroBusquedaSesiones.trim()) {
      const busqueda = this.filtroBusquedaSesiones.toLowerCase();
      resultado = resultado.filter(s =>
        (s.loginName && s.loginName.toLowerCase().includes(busqueda)) ||
        (s.ipAddress && s.ipAddress.toLowerCase().includes(busqueda)) ||
        (s.accion && s.accion.toLowerCase().includes(busqueda))
      );
    }
    this.sesionesFiltradas = resultado;
    this.paginaSesiones = 1;
  }

  limpiarFiltrosSesiones(): void {
    this.filtroBusquedaSesiones = '';
    this.filtroAccionSesion = '';
    this.aplicarFiltrosSesiones();
  }

  get sesionesPaginadas(): Sesion[] {
    const inicio = (this.paginaSesiones - 1) * this.itemsPorPaginaSesiones;
    const fin = inicio + this.itemsPorPaginaSesiones;
    return this.sesionesFiltradas.slice(inicio, fin);
  }

  get totalPaginasSesiones(): number {
    return Math.ceil(this.sesionesFiltradas.length / this.itemsPorPaginaSesiones);
  }

  cambiarPaginaSesiones(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasSesiones) {
      this.paginaSesiones = pagina;
    }
  }

  getAccionSesionClass(accion: string): string {
    switch(accion?.toUpperCase()) {
      case 'ACTIVA':   return 'sesion-activa';
      case 'CERRADA':  return 'sesion-cerrada';
      default:         return 'sesion-inactiva';
    }
  }

  getEstadoClass(estado: string): string {
    switch(estado.toLowerCase()) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      case 'bloqueado': return 'estado-bloqueado';
      default: return '';
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

  bloquearUsuario(sesion: any): void {
    const idReal = sesion.idSesion || sesion.id_sesion || sesion.id;
    if (!idReal) {
      this.mensajeError = 'Error: ID de sesión no encontrado.';
      return;
    }
    if (window.confirm(`⚠️ ¿Está seguro de DAR DE BAJA al usuario ${sesion.loginName} y cerrarle la sesión?`)) {
      this.adminService.cambiarEstadoCuentaYSesion(idReal, 'Inactivo').subscribe({
        next: () => {
          sesion.estadoValidacion = 'Inactivo';
          sesion.accion = 'CERRADA';
          sesion.fechaCierre = new Date().toISOString();
        },
        error: (err) => {
          console.error('Error al dar de baja:', err);
          this.mensajeError = 'Error al comunicar con el servidor para bloquear la cuenta.';
        }
      });
    }
  }

  reactivarUsuario(sesion: any): void {
    const idReal = sesion.idSesion || sesion.id_sesion || sesion.id;
    if (!idReal) {
      this.mensajeError = 'Error: ID de sesión no encontrado.';
      return;
    }
    if (window.confirm(`✅ ¿Desea REACTIVAR el acceso para el usuario ${sesion.loginName}?`)) {
      this.adminService.cambiarEstadoCuentaYSesion(idReal, 'Activo').subscribe({
        next: () => {
          sesion.estadoValidacion = 'Activo';
        },
        error: (err) => {
          console.error('Error al reactivar:', err);
          this.mensajeError = 'Error al comunicar con el servidor para reactivar la cuenta.';
        }
      });
    }
  }

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
