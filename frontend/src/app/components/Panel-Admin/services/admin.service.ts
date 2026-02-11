import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // Ajusta la URL si es necesario
  private apiUrl = 'http://localhost:8080/api/usuarios-bd/registrar-completo';
  private rolesUrl = 'http://localhost:8080/api/usuarios-bd/roles';

  private url ='';

  constructor(private http: HttpClient) { }

  obtenerRolesDeBD(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl);
  }

  crearAdministrador(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { responseType: 'text' });
  }

  // ========== CATEGORÍAS ==========
  getCategoriasCatalogo(): Observable<any> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/categorias`);
  }

  agregarCategoria(categoria: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/academico/categorias`, categoria);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }

// ========== CARRERAS ==========
  getCarrerasCatalogo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/carreras`);
  }

  agregarCarrera(carrera: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/carreras`, carrera);
  }

  eliminarCarrera(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carreras/${id}`);
  }

// ========== FACULTADES ==========
  getFacultadesCatalogo(): Observable<any> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/facultades`);
  }

  agregarFacultad(facultad: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/academico/facultades`, facultad);
  }

  eliminarFacultad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/facultades/${id}`);
  }

// ========== IDIOMAS ==========
  getIdiomasCatalogo(): Observable<any> {
    // Ajusta la URL según tu controlador de Spring Boot (ej: IdiomaController)
    return this.http.get<any[]>(`http://localhost:8080/api/academico/idiomas`);
  }

// ========== AGREGAR IDIOMA ==========
  agregarIdioma(idioma: any): Observable<any> {
    // Asegúrate de que esta URL coincida con la de tu @GetMapping (http://localhost:8080/api/academico/idiomas)
    return this.http.post(`http://localhost:8080/api/academico/idiomas`, idioma);
  }

  eliminarIdioma(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/idiomas/${id}`);
  }

// ========== JORNADAS ==========
  getJornadasCatalogo(): Observable<any> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/jornadas`);
  }

  agregarJornada(jornada: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/academico/jornadas`, jornada);
  }

  eliminarJornada(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jornadas/${id}`);
  }

// ========== MODALIDADES ==========
  getModalidadesCatalogo(): Observable<any> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/modalidades`);
  }

  agregarModalidad(modalidad: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/academico/modalidades`, modalidad);
  }

  eliminarModalidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/modalidades/${id}`);
  }

  // Para los reportes

  // ========== REPORTES ==========
  getReporteOfertas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes/ofertas`, filtros);
  }

  getReportePostulaciones(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes/postulaciones`, filtros);
  }

  getReporteUsuarios(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes/usuarios`, filtros);
  }

  getReporteEmpresas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes/empresas`, filtros);
  }

  getReporteEstadisticas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes/estadisticas`, filtros);
  }

// ========== EXPORTAR ==========
  exportarExcel(datos: any[], nombreArchivo: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reportes/exportar/excel`,
      { datos, nombreArchivo },
      { responseType: 'blob' }
    );
  }

  exportarPDF(tipoReporte: string, filtros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reportes/exportar/pdf`,
      { tipoReporte, filtros },
      { responseType: 'blob' }
    );
  }

}
