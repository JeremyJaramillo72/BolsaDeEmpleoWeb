import { Injectable } from '@angular/core';
import { ConfirmService } from './confirm.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SesionExpiradaService {

  private enProceso = false;

  constructor(
    private confirmService: ConfirmService,
    private notificationService: NotificationService
  ) {}

  async notificar(): Promise<void> {
    if (this.enProceso) return;
    if (!localStorage.getItem('token') && !localStorage.getItem('idUsuario')) return;

    this.enProceso = true;
    this.notificationService.desconectar();

    try {
      await this.confirmService.abrir(
        'Tu sesión ha sido cerrada. Por favor, vuelve a iniciar sesión para continuar.',
        'Sesión cerrada',
        'advertencia',
        true
      );
    } finally {
      this.limpiarYRedirigir();
    }
  }

  private limpiarYRedirigir(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.enProceso = false;
    window.location.href = '/login';
  }
}
