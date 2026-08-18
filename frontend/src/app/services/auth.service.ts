import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';

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
    return this.http.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
  }

  validarSesionActiva(): Observable<{ valida: boolean; error?: string }> {
    return this.http.get<{ valida: boolean; error?: string }>(`${API_BASE_URL}/auth/validar-sesion`);
  }

  obtenerFotoPerfil(idUsuario: string): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${API_BASE_URL}/auth/foto-perfil/${idUsuario}`);
  }
}
