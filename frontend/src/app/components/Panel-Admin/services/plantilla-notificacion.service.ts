import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlantillaNotificacionService {

  private apiUrl = '/api/plantillas';

  constructor(private http: HttpClient) { }

  obtenerPlantillas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  obtenerPlantilla(tipo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tipo}`);
  }

  // Ya no mandamos el idUsuario
  actualizarPlantilla(id: number, titulo: string, contenido: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {
      titulo,
      contenido
    });
  }

  obtenerHistorial(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }
}
