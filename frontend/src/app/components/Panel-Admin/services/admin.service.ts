import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // Ajusta la URL si es necesario
  private apiUrl = 'http://localhost:8080/api/usuarios-bd/registrar-completo';
  private rolesUrl = 'http://localhost:8080/api/usuarios-bd/roles';

  constructor(private http: HttpClient) { }

  obtenerRolesDeBD(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl);
  }

  crearAdministrador(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { responseType: 'text' });
  }
}
