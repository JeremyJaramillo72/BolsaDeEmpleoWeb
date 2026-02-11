import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Esta función devuelve TRUE si el usuario tiene permiso para ver la sección
  tienePermiso(permisoRequerido: string): boolean {

    // 1. Recuperamos datos del localStorage
    const idRol = localStorage.getItem('idRol');
    const permisosString = localStorage.getItem('permisosUi');

    // 2. Si es ROL 1 (Admin Maestro), ve TODO siempre.
    if (idRol && idRol == '1') {
      return true;
    }

    // 3. Si no hay permisos guardados, no ve nada
    if (!permisosString) {
      return false;
    }

    // 4. Convertimos "USERS,CATALOGOS" en un array ['USERS', 'CATALOGOS']
    const listaPermisos = permisosString.split(',');

    // 5. Buscamos si tiene el permiso
    return listaPermisos.includes(permisoRequerido);
  }

  // Método opcional para salir
  logout() {
    localStorage.clear();
  }
}
