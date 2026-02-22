import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OfertaHabilidadDTO {
  idHabilidad: number;
  nivelRequerido: string;
  esObligatorio: boolean;
  nombreHabilidad?: string;
}

export interface RequisitoManualDTO {
  descripcion: string;
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
  habilidades?: OfertaHabilidadDTO[];
  requisitos_manuales?: RequisitoManualDTO[];
  ciudad?: string;       // Para mostrar "Quito" en vez de 1
  modalidad?: string;    // Para mostrar "Presencial" en vez de 1
  jornada?: string;      // Para mostrar "Tiempo Completo" en vez de 1
  postulantes?: number;  // Para el contador de la tarjeta
  esFavorito?: boolean;  // Campo UI para favoritos
  // Campo UI para expandir detalles
  mostrarDetalles?: boolean;
}

export interface OfertaDetalladaDTO {
  idOferta: number;
  titulo: string;
  descripcion: string;
  cantidadVacantes: number;
  experienciaMinima: number;
  fechaInicio: string;
  fechaCierre: string;
  nombreModalidad: string;
  nombreJornada: string;
  nombreCategoria: string;
  salarioMin: number;
  salarioMax: number;
  estadoOferta: string;
  // Datos de favoritas
  idFavoritas?: number | null;
  estadoFav?: string | null;
  // Datos de postulación
  idPostulacion?: number | null;
  estadoValidacion?: string | null;
  // Campo UI
  esFavorito?: boolean;  // Campo UI para favoritos
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

  obtenerCategorias() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/categorias');
  }

  obtenerModalidades() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/modalidades');
  }

  obtenerJornadas() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/jornadas');
  }
  obtenerProvincias(){
    return this.http.get<any[]>('http://localhost:8080/api/academico/provincias')
  }
  obtenerProvinciasPorCiudad(idProvincia: Number){
    return this.http.get<any[]>(`http://localhost:8080/api/academico/ciudades/${idProvincia}`)
  }
  obtenerTiposHabilidad() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/tipos-habilidad');
  }

  obtenerHabilidadesPorTipo(idTipo: number) {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/habilidades/${idTipo}`);
  }
  obtenerPostulantesPorOferta(idOferta: number): Observable<any[]> {

    return this.http.get<any[]>(`${this.apiUrl}/${idOferta}/postulantes`);
  }
  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  listarActivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estado/Activa`);
  }
  listarOfertasCompleto(idUsuario: number): Observable<OfertaDetalladaDTO[]> {
    return this.http.get<OfertaDetalladaDTO[]>(`${this.apiUrl}/completo/${idUsuario}`);
  }

  toggleFavorita(idOferta: number, idUsuario: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${idOferta}/favorita/${idUsuario}`, {});
  }

  // Métodos para postulaciones
  postular(idUsuario: number, idOferta: number, archivo: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('idUsuario', idUsuario.toString());
    formData.append('idOferta', idOferta.toString());
    if (archivo) {
      formData.append('archivo', archivo);
    }
    return this.http.post('http://localhost:8080/api/postulaciones/postular', formData);
  }

  cancelarPostulacion(idPostulacion: number): Observable<any> {
    return this.http.put(`http://localhost:8080/api/postulaciones/cancelar/${idPostulacion}`, {});
  }

  obtenerArchivoCV(idPostulacion: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/postulaciones/archivo/${idPostulacion}`);
  }
}
