import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Obtenemos el token del localStorage
    const token = localStorage.getItem('token');

    // 2. Si hay token, clonamos la petición y le añadimos el header Authorization
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // 3. Manejamos la respuesta y capturamos errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el servidor responde 401, significa que la sesión fue CERRADA en el backend
        if (error.status === 401) {
          console.error('Sesión finalizada. Redirigiendo al login...');

          // Limpiamos los datos del usuario para que no queden rastros
          localStorage.removeItem('token');
          localStorage.clear();

          // ¡AFUERA! Mandamos al usuario al login inmediatamente
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
