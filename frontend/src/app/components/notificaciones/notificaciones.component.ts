import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, NotificacionDTO } from '../../services/notification.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: NotificacionDTO[] = [];
  filtroActivo: 'todas' | 'leidas' | 'noLeidas' = 'todas';
  filtroTipo: string = 'todas';
  idUsuario: string = '';
  tiposDisponibles: string[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idUsuario = localStorage.getItem('idUsuario') || '';
    if (!this.idUsuario) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar todas las notificaciones para el historial completo
    this.notificationService.cargarHistorial(Number(this.idUsuario));

    this.notificationService.notificaciones$.subscribe((data) => {
      this.notificaciones = data.sort((a, b) =>
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );
      this.extraerTiposDisponibles();
    });
  }

  private extraerTiposDisponibles(): void {
    const tipos = new Set(this.notificaciones.map(n => n.tipo));
    this.tiposDisponibles = Array.from(tipos).sort();
  }

  obtenerNotificacionesFiltradas(): NotificacionDTO[] {
    let filtradas = this.notificaciones;

    // Filtro por estado (leída/no leída)
    if (this.filtroActivo === 'leidas') {
      filtradas = filtradas.filter(n => n.leida);
    } else if (this.filtroActivo === 'noLeidas') {
      filtradas = filtradas.filter(n => !n.leida);
    }

    // Filtro por tipo
    if (this.filtroTipo !== 'todas') {
      filtradas = filtradas.filter(n => n.tipo === this.filtroTipo);
    }

    return filtradas;
  }

  obtenerConteoBadge(filtro: 'leidas' | 'noLeidas'): number {
    if (filtro === 'leidas') {
      return this.notificaciones.filter(n => n.leida).length;
    } else {
      return this.notificaciones.filter(n => !n.leida).length;
    }
  }

  marcarComoLeida(notif: NotificacionDTO): void {
    if (notif.leida) return;
    this.notificationService.marcarComoLeida(notif.idNotificacion).subscribe();
  }

  marcarTodasComoLeidas(): void {
    const idUsuario = parseInt(this.idUsuario, 10);
    this.notificationService.marcarTodasComoLeidas(idUsuario);
  }

  navigarSiTieneEnlace(notif: NotificacionDTO): void {
    this.marcarComoLeida(notif);
    if (notif.enlace) {
      this.router.navigateByUrl(notif.enlace);
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
  }

  obtenerIconoMaterial(icono: string): string {
    const mapeo: { [key: string]: string } = {
      'bell': 'notifications',
      'work': 'work',
      'business': 'business',
      'groups': 'groups',
      'person': 'person',
      'assignment': 'assignment',
      'check': 'check_circle',
      'error': 'error',
      'info': 'info',
      'warning': 'warning',
      'domain': 'domain',
      'assignment_late': 'assignment_late'
    };
    return mapeo[icono] || 'notifications';
  }
}
