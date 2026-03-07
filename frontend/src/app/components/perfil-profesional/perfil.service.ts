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

  constructor(private http: HttpClient) {
  }

  private logoSource = new BehaviorSubject<string>('');
  logoActual$ = this.logoSource.asObservable();

  obtenerDatosUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }


  getFacultades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiCatalogos}/facultades`);
  }

  getCarrerasPorFacultad(idFacultad: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiCatalogos}/carreras/${idFacultad}`);
  }

  getIdiomasCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiCatalogos}/idiomas`);
  }

  getCargosCatalogo(): Observable<any> {
    return this.http.get(`${this.apiCatalogos}/cargos`);
  }

  getEmpresasCatalogo(): Observable<any> {
    return this.http.get(`${this.apiCatalogos}/empresas`);
  }


  getCiudadesPorProvincia(idProvincia: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiCatalogos}/ciudades/${idProvincia}`);
  }

  obtenerProvincias() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/provincias')
  }


  registrarItemPerfil(idUsuario: number, tipoItem: string, formData: FormData): Observable<any> {
    formData.append('idUsuario', idUsuario.toString());
    let endpoint = '';
    switch (tipoItem) {
      case 'academico':
        endpoint = '/perfil-academico/registrar';
        break;
      case 'idioma':
        endpoint = '/perfil-idioma/registrars';
        break;
      case 'experiencia':
        endpoint = '/exp-laboral/registrar';
        break;
      case 'curso':
        endpoint = '/perfil-curso/registrar';
        break;
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

  crearNuevoCargo(datosCargo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cargos/crear`, datosCargo);
  }

  crearNuevaEmpresa(datosEmpresa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas/crear`, datosEmpresa);
  }

  obtenerCategorias() {
    return this.http.get<any[]>('http://localhost:8080/api/academico/categorias');

  }

  actualizarDatosPersonales(idUsuario: number, datos: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/perfil/${idUsuario}/actualizar-personales`, datos);
  }

  actualizarExperiencia(formData: FormData) {
    return this.http.post(`${this.apiUrl}/exp-laboral/actualizar`, formData);
  }
  actualizarCurso (formData: FormData){
    return this.http.post(`${this.apiUrl}/modificar-cursos/actualizar`,formData)
  }

  actualizarAcademico(formData: FormData) {
    return this.http.post(`${this.apiUrl}/academico/actualizar`, formData);
  }
  actualizarIdioma(formData: FormData) {
    return this.http.post(`${this.apiUrl}/idioma/actualizar`, formData);
  }
}
