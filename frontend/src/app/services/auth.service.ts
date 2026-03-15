import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  tienePermiso(permisoRequerido: string): boolean {

    const idRol = localStorage.getItem('idRol');
    const permisosString = localStorage.getItem('permisosUi');


    if (idRol && idRol == '1') {
      return true;
    }


    if (!permisosString) {
      return false;
    }


    const listaPermisos = permisosString.split(',');

    return listaPermisos.includes(permisoRequerido);
  }


  logout() {

    return this.http.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
  }
  obtenerFotoPerfil(idUsuario: string): Observable<{url: string}> {
    return this.http.get<{url: string}>(`http://localhost:8080/api/auth/foto-perfil/${idUsuario}`);
  }
}
