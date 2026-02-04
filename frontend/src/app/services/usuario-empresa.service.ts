import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UsuarioEmpresaDTO {
  idEmpresa?: number;
  idUsuario: number;
  nombre: string;
  descripcion: string;
  ruc: string;
  sitioWeb: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioEmpresaService {


  private apiUrl = 'http://localhost:8080/api/empresa-perfil';

  constructor(private http: HttpClient) { }

  obtenerPerfilPorUsuario(idUsuario: number): Observable<UsuarioEmpresaDTO> {
    return this.http.get<UsuarioEmpresaDTO>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  actualizarPerfil(idEmpresa: number, datos: UsuarioEmpresaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idEmpresa}`, datos);
  }
}
