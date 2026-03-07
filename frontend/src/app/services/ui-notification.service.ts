import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UiNotificationService {

  constructor(private toastr: ToastrService) {}

  exito(mensaje: string): void {
    setTimeout(() => this.toastr.success(mensaje));
  }

  error(mensaje: string): void {
    setTimeout(() => this.toastr.error(mensaje));
  }

  advertencia(mensaje: string): void {
    setTimeout(() => this.toastr.warning(mensaje));
  }

  info(mensaje: string): void {
    setTimeout(() => this.toastr.info(mensaje));
  }
}
