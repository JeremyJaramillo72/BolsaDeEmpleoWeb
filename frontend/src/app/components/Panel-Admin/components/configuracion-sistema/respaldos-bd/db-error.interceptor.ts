import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const dbErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorString = JSON.stringify(error.error || error.message || '').toLowerCase();


      const isDatabaseFatal = (error.status === 500) && (
        errorString.includes('jdbcconnectionexception') ||
        errorString.includes('cannotcreatetransactionexception') ||
        (errorString.includes('hikaripool') && errorString.includes('connection is not available')) ||
        (errorString.includes('fatal') && errorString.includes('terminating connection')) ||
        (errorString.includes('fatal: database') && errorString.includes('does not exist'))
      );

      if (isDatabaseFatal) {

        if (!req.url.includes('/backups-disponibles') && !req.url.includes('/restaurar')) {

          const rolUsuario = localStorage.getItem('rol');

          if (rolUsuario === 'ADMINISTRADOR') {
            console.error('🚨 COLAPSO DE BASE DE DATOS CONFIRMADO. Activando Modo Dios.');
            router.navigate(['/emergencia-db']);
          } else {
            console.error('🚨 COLAPSO DE BASE DE DATOS. Redirigiendo a pantalla de mantenimiento.');
            router.navigate(['/mantenimiento']);
          }
        }
      }

      return throwError(() => error);
    })
  );
};
