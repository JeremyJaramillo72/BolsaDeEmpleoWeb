import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';
import { UiNotificationService } from '../../../../../services/ui-notification.service';

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
  styleUrls: ['./sesiones.css', '../auditorias-responsive.css']
})
export class SesionesComponent implements OnInit, OnDestroy {
  sesiones: Sesion[] = [];
  sesionesFiltradas: Sesion[] = [];
  cargandoSesiones = false;
  mensajeError = '';
  cerrandoSesionId: number | null = null;

  filtroBusquedaSesiones = '';
  filtroAccionSesion = 'ACTIVA';

  paginaSesiones = 1;
  itemsPorPaginaSesiones = 10;

  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor(
    private adminService: AdminService,
    private confirmService: ConfirmService,
    private ui: UiNotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarSesiones();
    this.refreshInterval = setInterval(() => this.cargarSesiones(true), 15000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarSesiones(silencioso = false): void {
    if (!silencioso) {
      this.cargandoSesiones = true;
    }

    const estadoApi = this.filtroAccionSesion || 'ALL';

    this.adminService.getSesiones(estadoApi).subscribe({
      next: (data: Sesion[]) => {
        this.ngZone.run(() => {
          this.sesiones = data;
          this.aplicarFiltrosSesiones();
          this.cargandoSesiones = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargandoSesiones = false;
          this.mensajeError = 'Error al cargar sesiones';
          this.cdr.detectChanges();
        });
      }
    });
  }

  aplicarFiltrosSesiones(): void {
    let resultado = [...this.sesiones];
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

  onCambioFiltroEstado(): void {
    this.cargarSesiones();
  }

  limpiarFiltrosSesiones(): void {
    this.filtroBusquedaSesiones = '';
    this.filtroAccionSesion = 'ACTIVA';
    this.cargarSesiones();
  }

  get sesionesPaginadas(): Sesion[] {
    const inicio = (this.paginaSesiones - 1) * this.itemsPorPaginaSesiones;
    const fin = inicio + this.itemsPorPaginaSesiones;
    return this.sesionesFiltradas.slice(inicio, fin);
  }

  get totalPaginasSesiones(): number {
    return Math.ceil(this.sesionesFiltradas.length / this.itemsPorPaginaSesiones) || 1;
  }

  cambiarPaginaSesiones(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasSesiones) {
      this.paginaSesiones = pagina;
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

  expulsarUsuario(sesion: Sesion): void {
    const idReal = sesion.idSesion;
    if (!idReal) return;

    this.confirmService.abrir(
      `¿Cerrar la sesión activa de ${sesion.loginName}? El usuario será desconectado inmediatamente.`,
      'Cerrar sesión',
      'advertencia'
    ).then((acepto: boolean) => {
      if (!acepto) return;

      this.ngZone.run(() => {
        this.cerrandoSesionId = idReal;
        this.cdr.detectChanges();
      });

      this.adminService.cambiarEstadoCuentaYSesion(idReal, 'CERRADA').subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.cerrandoSesionId = null;
            this.sesiones = this.sesiones.filter(s => s.idSesion !== idReal);
            this.aplicarFiltrosSesiones();
            this.ui.exito(`Sesión de ${sesion.loginName} cerrada. El usuario fue desconectado.`);
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.cerrandoSesionId = null;
            this.ui.error('No se pudo cerrar la sesión.');
            this.cdr.detectChanges();
          });
        }
      });
    });
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
      error: () => {
        this.ui.error('Error al exportar sesiones');
      }
    });
  }
}
