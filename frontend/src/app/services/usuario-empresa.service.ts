import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

export interface UsuarioEmpresaDTO {
  idEmpresa?: number;
  idUsuario: number;
  nombre: string;
  descripcion: string;
  ruc: string;
  sitioWeb: string;
  correo: string;
  urlImagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioEmpresaService {

  private logoSource = new BehaviorSubject<string>('');
  logoActual$ = this.logoSource.asObservable();
  private apiUrl = 'http://localhost:8080/api/empresa-perfil';

  constructor(private http: HttpClient) { }

  obtenerPerfilPorUsuario(idUsuario: number): Observable<UsuarioEmpresaDTO> {
    return this.http.get<UsuarioEmpresaDTO>(`${this.apiUrl}/usuario/${idUsuario}`);
  }
  actualizarLogo(url: string) {
    this.logoSource.next(url);
  }
  actualizarPerfil(idEmpresa: number, datos: UsuarioEmpresaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idEmpresa}`, datos);
  }
  subirLogoEmpresa(id: number, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post(`http://localhost:8080/api/empresa-perfil/${id}/logo`, formData);
  }

}
