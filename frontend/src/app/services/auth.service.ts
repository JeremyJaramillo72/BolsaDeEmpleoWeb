import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private nombreUsuarioSource = new BehaviorSubject<string>(localStorage.getItem('nombre') || 'Usuario');
  nombreActual$ = this.nombreUsuarioSource.asObservable();

  private fotoUsuarioSource = new BehaviorSubject<string | null>(null); // Empieza en nulo
  fotoActual$ = this.fotoUsuarioSource.asObservable();

  actualizarNombreEnPantalla(nuevoNombre: string) {
    localStorage.setItem('nombre', nuevoNombre);
    this.nombreUsuarioSource.next(nuevoNombre);
  }
  actualizarFotoEnPantalla(nuevaUrl: string) {
    localStorage.setItem('urlFoto', nuevaUrl);
    this.fotoUsuarioSource.next(nuevaUrl);
  }
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
