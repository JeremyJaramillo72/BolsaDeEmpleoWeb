import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OfertaHabilidadDTO {
  idHabilidad: number;
  nivelRequerido: string;
  esObligatorio: boolean;
  nombreHabilidad?: string;
}

export interface OfertaLaboralDTO {
  idOferta?: number;
  idEmpresa: number;
  idModalidad: number;
  idCategoria: number;
  idJornada: number;
  idCiudad: number;
  titulo: string;
  descripcion: string;
  salarioMin: number;
  salarioMax: number;
  cantidadVacantes: number;
  experienciaMinima: number;


  fechaInicio: string;
  fechaCierre: string;
  estadoOferta?: string;
  habilidades: OfertaHabilidadDTO[];

  ciudad?: string;       // Para mostrar "Quito" en vez de 1
  modalidad?: string;    // Para mostrar "Presencial" en vez de 1
  jornada?: string;      // Para mostrar "Tiempo Completo" en vez de 1
  postulantes?: number;  // Para el contador de la tarjeta
}

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private apiUrl = 'http://localhost:8080/api/ofertas';

  constructor(private http: HttpClient) { }

  crearOferta(oferta: OfertaLaboralDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, oferta);
  }

  obtenerOfertasPorEmpresa(idEmpresa: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/${idEmpresa}`);
  }
}
