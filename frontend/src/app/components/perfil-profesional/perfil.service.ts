import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {UsuarioEmpresaDTO} from '../../services/usuario-empresa.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:8080/api/perfil';
  private apiCatalogos = 'http://localhost:8080/api/academico';

  constructor(private http: HttpClient) { }
  private logoSource = new BehaviorSubject<string>('');
  logoActual$ = this.logoSource.asObservable();

  obtenerDatosUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }


  getFacultades(): Observable<any[]> { return this.http.get<any[]>(`${this.apiCatalogos}/facultades`); }
  getCarrerasPorFacultad(idFacultad: number): Observable<any[]> { return this.http.get<any[]>(`${this.apiCatalogos}/carreras/${idFacultad}`); }
  getIdiomasCatalogo(): Observable<any[]> { return this.http.get<any[]>(`${this.apiCatalogos}/idiomas`); }
  getCargosCatalogo(): Observable<any> { return this.http.get(`${this.apiCatalogos}/cargos`); }
  getEmpresasCatalogo(): Observable<any> { return this.http.get(`${this.apiCatalogos}/empresas`); }
  getProvincias(): Observable<any[]> { return this.http.get<any[]>(`${this.apiCatalogos}/provincias`); }
  getCiudadesPorProvincia(idProvincia: number): Observable<any[]> { return this.http.get<any[]>(`${this.apiCatalogos}/ciudades/${idProvincia}`); }


  registrarItemPerfil(idUsuario: number, tipoItem: string, formData: FormData): Observable<any> {
    formData.append('idUsuario', idUsuario.toString());
    let endpoint = '';
    switch (tipoItem) {
      case 'academico': endpoint = '/perfil-academico/registrar'; break;
      case 'idioma': endpoint = '/perfils-idioma/registrars'; break;
      case 'experiencia': endpoint = '/exp-laboral/registrar'; break;
      case 'curso': endpoint = '/perfil-curso/registrar'; break;
    }
    return this.http.post(`http://localhost:8080/api${endpoint}`, formData);
  }

  actualizarLogo(url: string) {
    this.logoSource.next(url);
  }

  subirLogoProfesional(id: number, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post(`http://localhost:8080/api/perfil/${id}/foto`, formData);
  }
  eliminarItemPerfil(idUsuario: number, tipoItem: string, idItem: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/perfil/${idUsuario}/item/${tipoItem}/${idItem}`);
  }
}
