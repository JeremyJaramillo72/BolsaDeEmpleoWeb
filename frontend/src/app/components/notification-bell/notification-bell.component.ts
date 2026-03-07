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
  dropdownOpen: boolean = false;
  activeTab: 'nuevas' | 'leidas' = 'nuevas';
  isLoading: boolean = true;
  private sub?: Subscription;
  idUsuario: number = 0;

  get notificacionesNuevas(): any[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  get notificacionesLeidas(): any[] {
    return this.notificaciones.filter(n => n.leida);
  }

  get listaActual(): any[] {
    return this.activeTab === 'nuevas' ? this.notificacionesNuevas : this.notificacionesLeidas;
  }

  constructor(
    public notificationService: NotificationService,
    private router: Router,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idUsuario = Number(localStorage.getItem('idUsuario'));

    if (this.idUsuario) {
      this.notificationService.cargarHistorial(this.idUsuario);
      this.notificationService.conectarWebSocket(this.idUsuario);
    }

    this.sub = this.notificationService.notificaciones$.subscribe(data => {
      this.notificaciones = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
      this.activeTab = 'nuevas';
    }
  }

  cerrarDropdown() {
    this.dropdownOpen = false;
  }

  clickNotificacion(notif: any) {
    if (!notif.leida) {
      this.notificationService.marcarComoLeida(notif.idNotificacion).subscribe();
    }
    this.cerrarDropdown();
    if (notif.enlace) {
      const ruta = notif.enlace.startsWith('/') ? notif.enlace : '/' + notif.enlace;
      this.router.navigate([ruta]);
    }
  }

  marcarTodas() {
    if (this.idUsuario) {
      this.notificationService.marcarTodasComoLeidas(this.idUsuario);
    }
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
