import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {

  private apiUrl = 'http://localhost:8080/api/revision-postulante';

  constructor(private http: HttpClient) { }

  obtenerCandidatosDeOferta(idOferta: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ofertas/${idOferta}/postulantes`);
  }

  obtenerPerfilCompleto(idPostulacion: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/postulaciones/${idPostulacion}/perfil-completo`);
  }
  evaluarItemIndividual(idPostulacion: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/postulaciones/${idPostulacion}/evaluar-item`, payload);
  }
  evaluarPostulacionGeneral(idPostulacion: number, evaluacion: any): Observable<any> {

    return this.http.post(`${this.apiUrl}/postulaciones/${idPostulacion}/evaluar`, evaluacion);
  }
}
