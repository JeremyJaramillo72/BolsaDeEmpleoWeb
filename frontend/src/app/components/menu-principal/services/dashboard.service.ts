import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard'; // Ajusta a tu puerto

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`, { withCredentials: true });
  }

  getEmpresaStats(idEmpresa: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresa/${idEmpresa}`, { withCredentials: true });
  }

  getPostulanteStats(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/postulante/${idUsuario}`, { withCredentials: true });
  }
}
