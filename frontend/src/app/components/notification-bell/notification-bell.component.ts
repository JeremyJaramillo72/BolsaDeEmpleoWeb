import { Component, OnInit, OnDestroy, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notificaciones: any[] = [];
  notificacionesActivas: any[] = [];
  dropdownOpen: boolean = false;
  isLoading: boolean = true;
  private sub?: Subscription;
  private webSocketSub?: Subscription;
  idUsuario: number = 0;

  constructor(
    public notificationService: NotificationService,
    private router: Router,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idUsuario = Number(localStorage.getItem('idUsuario'));

    if (this.idUsuario) {
      this.notificationService.conectarWebSocket(this.idUsuario);
      this.cargarNotificacionesActivas();

      this.webSocketSub = this.notificationService.suscribirseANotificacionesActivas().subscribe((notifs) => {
        this.notificacionesActivas = notifs.filter(n => !n.leida);
        this.cdr.detectChanges();
      });
    }
  }

  private cargarNotificacionesActivas(): void {
    if (this.idUsuario) {
      this.notificationService.cargarNotificacionesActivas(this.idUsuario).subscribe({
        next: (data) => {
          this.notificacionesActivas = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando notificaciones activas:', err);
          this.notificacionesActivas = [];
          this.isLoading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.webSocketSub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.dropdownOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.cerrarDropdown();
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      this.cargarNotificacionesActivas();
    }
  }

  cerrarDropdown() {
    this.dropdownOpen = false;
  }

  clickNotificacion(notif: any) {
    if (!notif.leida) {
      this.notificationService.marcarComoLeida(notif.idNotificacion).subscribe({
        next: () => {
          // Recargar notificaciones después de marcar como leída
          this.cargarNotificacionesActivas();
        },
        error: (err) => {
          console.error('Error marcando notificación como leída:', err);
        }
      });
    }
    this.cerrarDropdown();
    if (notif.enlace) {
      const ruta = notif.enlace.startsWith('/') ? notif.enlace : '/' + notif.enlace;
      this.router.navigate([ruta]);
    }
  }

  marcarTodas() {
    if (this.idUsuario) {
      this.notificationService.marcarTodasComoLeidas(this.idUsuario).subscribe({
        next: () => {
          // Recargar después de marcar todas
          this.cargarNotificacionesActivas();
        },
        error: (err) => {
          console.error('Error marcando todas como leídas:', err);
        }
      });
    }
  }

  navigate(ruta: string) {
    this.router.navigate([ruta]);
    this.dropdownOpen = false;
  }

  get cantidadActivasSinLeer(): number {
    return this.notificacionesActivas.filter(n => !n.leida).length;
  }

  tiempoTranscurrido(fechaCreacion: string): string {
    if (!fechaCreacion) return '';
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diffMs = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `${dias}d`;
    const meses = Math.floor(dias / 30);
    return `${meses}mes`;
  }
}
