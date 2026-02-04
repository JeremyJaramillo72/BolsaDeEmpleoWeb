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
  salarioPromedio: number;
  fechaInicio: string;
  fechaCierre: string;
  estadoOferta?: string;
  habilidades: OfertaHabilidadDTO[];
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

  listarPorEmpresa(idEmpresa: number): Observable<OfertaLaboralDTO[]> {
    return this.http.get<OfertaLaboralDTO[]>(`${this.apiUrl}/empresa/${idEmpresa}`);
  }
}
