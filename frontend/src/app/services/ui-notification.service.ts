import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UiNotificationService {

  constructor(private toastr: ToastrService) {}

  exito(mensaje: string): void {
    this.toastr.success(mensaje);
  }

  error(mensaje: string): void {
    this.toastr.error(mensaje);
  }

  advertencia(mensaje: string): void {
    this.toastr.warning(mensaje);
  }

  info(mensaje: string): void {
    this.toastr.info(mensaje);
  }
}
