import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UiNotificationService {

  constructor(private toastr: ToastrService, private ngZone: NgZone) {}

  exito(mensaje: string): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.toastr.success(mensaje, '', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-bottom-right'
        });
      });
    }, 0);
  }

  error(mensaje: string): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.toastr.error(mensaje, '', {
          timeOut: 4000,
          progressBar: true,
          positionClass: 'toast-bottom-right'
        });
      });
    }, 0);
  }

  advertencia(mensaje: string): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.toastr.warning(mensaje, '', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-bottom-right'
        });
      });
    }, 0);
  }

  info(mensaje: string): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.toastr.info(mensaje, '', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-bottom-right'
        });
      });
    }, 0);
  }
}

