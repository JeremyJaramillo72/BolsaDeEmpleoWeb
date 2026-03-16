import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OfertaHabilidadDTO {
  idHabilidad: number;
  nivelRequerido: string;
  esObligatorio: boolean;
  nombreHabilidad?: string;
}

export interface RequisitoManualDTO {
  descripcion: string;
  esObligatorio?: boolean;
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
  externalOfferId?: string;
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
  observaciones?: string | null;
  // Habilidades y requisitos
  habilidades?: OfertaHabilidadDTO[];
  requisitos_manuales?: RequisitoManualDTO[];
  // Campos UI
  esFavorito?: boolean;
  mostrarDetalles?: boolean;
  nombreCiudad?: string;
  nombreEmpresa?: string;
  esExterna?: boolean;
  urlOfertaExterna?: string;
}

export interface FavoritaGuardadaDTO {
  idFavoritas: number;
  idOferta: number;
  origenOferta: string;
  estadoFav: string;
  titulo: string;
  descripcion: string;
  nombreEmpresa: string;
  nombreCiudad: string;
  fechaInicio?: string | null;
  fechaCierre?: string | null;
  salarioMin?: number | null;
  salarioMax?: number | null;
  urlAplicar?: string | null;
  idOrigenExterna?: string | null;
}

export interface JSearchOfertaDTO {
  jobId: string;
  jobTitle: string;
  employerName: string;
  jobEmploymentType: string;
  jobCity: string;
  jobState: string;
  jobCountry: string;
  jobDescription: string;
  jobPostedAt: string;
  jobApplyLink: string;
  jobGoogleLink: string;
  jobIsRemote: boolean;
}

export interface JSearchResponseDTO {
  status: string;
  requestId: string;
  page: number;
  numPages: number;
  query: string;
  country: string;
  datePosted: string;
  language: string;
  data: JSearchOfertaDTO[];
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

  buscarOfertasExternas(
    query: string,
    page: number,
    country: string,
    datePosted: string,
    language: string,
    workFromHome: boolean
  ): Observable<JSearchResponseDTO> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('country', country)
      .set('date_posted', datePosted)
      .set('work_from_home', workFromHome.toString());

    if (language?.trim()) {
      params = params.set('language', language.trim().toLowerCase());
    }

    return this.http.get<JSearchResponseDTO>(`${this.apiUrl}/externas/jsearch`, { params });
  }

  listarMisPostulaciones(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/revision-postulante/mis-postulaciones/${idUsuario}`);
  }

  obtenerExtraInfo(idOferta: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idOferta}/extra`);
  }


  // ── Métodos por sección ──────────────────────────────────────────────
  obtenerPerfilBase(idPostulacion: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/revision-postulante/postulaciones/${idPostulacion}/perfil-base`);
  }
  obtenerFormacion(idPostulacion: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/revision-postulante/postulaciones/${idPostulacion}/formacion`);
  }
  obtenerExperiencia(idPostulacion: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/revision-postulante/postulaciones/${idPostulacion}/experiencia`);
  }
  obtenerCursos(idPostulacion: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/revision-postulante/postulaciones/${idPostulacion}/cursos`);
  }
  obtenerIdiomas(idPostulacion: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/revision-postulante/postulaciones/${idPostulacion}/idiomas`);
  }

  toggleFavorita(idOferta: number, idUsuario: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${idOferta}/favorita/${idUsuario}`, {});
  }

  toggleFavoritaExterna(ofertaExterna: JSearchOfertaDTO, idUsuario: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/externas/favorita/${idUsuario}`, ofertaExterna);
  }

  obtenerFavoritasExternas(idUsuario: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/externas/favoritas/${idUsuario}`);
  }

  obtenerFavoritasUsuario(idUsuario: number): Observable<FavoritaGuardadaDTO[]> {
    return this.http.get<FavoritaGuardadaDTO[]>(`${this.apiUrl}/favoritas/${idUsuario}`);
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
  buscarEmpresasRegistradas(termino: string): Observable<any[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<any[]>(`${this.apiUrl}/admin/empresas/buscar`, { params });

  }
  registrarOfertaFisica(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar-fisica`, formData);
  }
  obtenerOfertasFisicasAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fisicas`);
  }
  crearCuentaEmpresaAdmin(datosEmpresa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/empresas/crear`, datosEmpresa);
  }
}
