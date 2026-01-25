import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // 1. Verificamos si existe el ID del usuario (esto confirma que se logueó)
    const idUsuario = localStorage.getItem('idUsuario');
    const rol = localStorage.getItem('rol');

    // Si no hay ID, significa que no ha iniciado sesión
    if (!idUsuario) {
      alert('¡Acceso denegado! Por favor, inicia sesión primero.');
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Validación de Roles (para rutas protegidas específicamente)
    const requiredRole = route.data['role'];

    // Si la ruta pide un rol y el usuario no lo tiene, lo bloqueamos
    if (requiredRole && rol !== requiredRole) {
      alert(`No tienes permisos de ${requiredRole} para entrar aquí.`);

      // Lo mandamos al menú principal porque ya está logueado, pero no tiene permiso aquí
      this.router.navigate(['/menu-principal']);
      return false;
    }
    // Si pasa todas las pruebas, puede entrar
    return true;
  }
}
