import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const dbErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorString = JSON.stringify(error.error || error.message || '').toLowerCase();

      const isServerDead = (error.status === 0);

      const isDatabaseFatal = (error.status === 500) && (
        errorString.includes('hikaripool') ||
        errorString.includes('connection is not available') ||
        errorString.includes('terminating connection') ||
        errorString.includes('database "bolsa-empleo-azure" does not exist')
      );


      const isCodingError = errorString.includes('does not exist') &&
        (errorString.includes('column') || errorString.includes('relation'));

      if ((isServerDead || isDatabaseFatal) && !isCodingError) {

        if (!req.url.includes('/backups-disponibles') && !req.url.includes('/restaurar')) {

          const rolUsuario = localStorage.getItem('rol');

          if (rolUsuario === 'ADMINISTRADOR') {
            console.error('🚨 INFRAESTRUCTURA CAÍDA. Modo Emergencia activado para Admin.');
            router.navigate(['/emergencia-db']);
          } else {
            console.error('🚨 SISTEMA EN MANTENIMIENTO. Redirigiendo usuario.');
            router.navigate(['/mantenimiento']);
          }
        }
      }

      return throwError(() => error);
    })
  );
};
