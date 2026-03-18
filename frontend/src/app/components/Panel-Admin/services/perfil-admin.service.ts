import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerfilAdminDTO {
  idUsuario:       number;
  nombre:          string;
  apellido:        string;
  correo:          string;
  telefono:        string | null;
  genero:          string | null;
  fechaNacimiento: string | null;
  urlImagen:       string | null;
}

@Injectable({ providedIn: 'root' })
export class PerfilAdminService {

  private readonly API = 'http://localhost:8080/api/perfil-admin';

  // ✅ foto$ — menú actualiza foto en tiempo real
  private readonly fotoSubject = new BehaviorSubject<string>(
      localStorage.getItem('fotoAdmin') ?? ''
  );
  readonly foto$ = this.fotoSubject.asObservable();

  // ✅ nombre$ — menú actualiza nombre en tiempo real
  private readonly nombreSubject = new BehaviorSubject<string>(
      localStorage.getItem('nombre') ?? ''
  );
  readonly nombre$ = this.nombreSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPerfil(idUsuario: number): Observable<PerfilAdminDTO> {
    return this.http.get<PerfilAdminDTO>(`${this.API}/${idUsuario}`);
  }

  actualizarPerfil(idUsuario: number, dto: Partial<PerfilAdminDTO>): Observable<PerfilAdminDTO> {
    return this.http.put<PerfilAdminDTO>(`${this.API}/${idUsuario}`, dto);
  }

  actualizarFoto(idUsuario: number, archivo: File):
      Observable<{ mensaje: string; urlImagen: string; perfil: PerfilAdminDTO }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ mensaje: string; urlImagen: string; perfil: PerfilAdminDTO }>(
        `${this.API}/${idUsuario}/foto`, formData
    );
  }

  // Emite nueva foto al menú en tiempo real
  emitirFoto(url: string): void {
    localStorage.setItem('fotoAdmin', url);
    this.fotoSubject.next(url);
  }

  // ✅ Emite nuevo nombre al menú en tiempo real
  emitirNombre(nombre: string, apellido: string): void {
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    localStorage.setItem('nombre', nombreCompleto);
    this.nombreSubject.next(nombreCompleto);
  }
}
