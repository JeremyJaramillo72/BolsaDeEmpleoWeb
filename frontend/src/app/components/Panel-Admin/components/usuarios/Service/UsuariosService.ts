import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  // Subject para notificar cambios en la lista de usuarios (Igual que en tu AdminService)
  private usuariosActualizados$ = new BehaviorSubject<boolean>(false);
  public usuariosActualizados = this.usuariosActualizados$.asObservable();

  // Aquí defines la ruta de tu API para este módulo
  private apiUsuariosUrl = 'http://localhost:8080/api/GestionUser';

  private apiUsuarios = 'http://localhost:8080/api/usuarios-bd';

  constructor(private http: HttpClient) { }

  // ==========================================
  // 👥 GESTIÓN GENERAL DE USUARIOS
  // ==========================================

  // 1. Obtener la lista completa de usuarios para la tabla
  getUsuariosTabla(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUsuariosUrl}/tabla`);
  }

  // 2. Cambiar el estado del usuario (ACTIVO / INACTIVO)
  cambiarEstadoUsuario(idUsuario: number, nuevoEstado: string): Observable<any> {
    // Usamos responseType: 'text' por si Spring Boot devuelve un simple String en lugar de JSON
    return this.http.put(
      `${this.apiUsuariosUrl}/${idUsuario}/estado?estado=${nuevoEstado}`,
      {},
      { responseType: 'text' }
    );
  }

  obtenerRolesDeBD(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUsuarios}/roles`);
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUsuarios}/registrar-completo`, usuario, { responseType: 'text' });
  }

  obtenerUsuario(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUsuariosUrl}/${idUsuario}`);
  }

  actualizarUsuario(idUsuario: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUsuariosUrl}/${idUsuario}`, datos);
  }

  eliminarUsuario(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.apiUsuariosUrl}/${idUsuario}`);
  }

  obtenerCiudades(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/academico/ciudades');
  }

  // ==========================================
  // 🔄 NOTIFICAR CAMBIOS EN LA LISTA
  // ==========================================
  notificarCambio(): void {
    this.usuariosActualizados$.next(true);
  }

}
