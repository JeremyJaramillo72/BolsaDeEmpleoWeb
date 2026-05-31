import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiNotificationService } from '../services/ui-notification.service';
import { SesionExpiradaService } from '../services/sesion-expirada.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const ui              = inject(UiNotificationService);
  const sesionExpirada  = inject(SesionExpiradaService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {

        case 0:
          ui.error('Sin conexión con el servidor.');
          break;

        case 401:
          if (!req.url.includes('/api/auth/login')) {
            void sesionExpirada.notificar();
          }
          break;

        case 403: {
          const mensaje403 =
            error.error?.error ||
            error.error?.message ||
            'No tienes permisos para realizar esta acción.';
          // El login ya muestra el mensaje del backend (cuenta pendiente, etc.)
          if (!req.url.includes('/api/auth/login')) {
            ui.error(mensaje403);
          }
          break;
        }

        case 500: {
          // Captura errores de permisos de PostgreSQL que llegan como 500
          const mensaje = (
            error.error?.message  ||
            error.error?.error    ||
            error.error?.detail   ||
            error.message         ||
            ''
          ).toLowerCase();

          const esPermisoBD =
            mensaje.includes('permission denied') ||
            mensaje.includes('access denied')     ||
            mensaje.includes('insufficient privilege');

          if (esPermisoBD) {
            ui.error('Sin permisos de base de datos para esta acción.');
          }
          // Otros 500 los maneja el error: de cada componente
          break;
        }
      }

      // Siempre re-lanza el error para que el error: del subscribe también lo reciba
      return throwError(() => error);
    })
  );
};
