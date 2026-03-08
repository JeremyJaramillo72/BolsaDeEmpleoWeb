import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UiNotificationService {

  constructor(private toastr: ToastrService) {}

  exito(mensaje: string): void {
    this.toastr.success(mensaje, '', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right'
    });
  }

  error(mensaje: string): void {
    this.toastr.error(mensaje, '', {
      timeOut: 4000,
      progressBar: true,
      positionClass: 'toast-bottom-right'
    });
  }

  advertencia(mensaje: string): void {
    this.toastr.warning(mensaje, '', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right'
    });
  }

  info(mensaje: string): void {
    this.toastr.info(mensaje, '', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right'
    });
  }
}

