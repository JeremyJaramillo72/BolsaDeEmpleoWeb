import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:8080/api/perfil'; // 👈 Tu endpoint de Spring Boot

  constructor(private http: HttpClient) { }

  // Recupera el objeto Usuario desde el backend
  obtenerDatosUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getFacultades(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/facultades`);
  }
  getCarrerasPorFacultad(idFacultad: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/academico/carreras/${idFacultad}`);
  }

  registrarTitulo(idUsuario: number, titulo: any): Observable<any> {
    const formData = new FormData();

    // Agregamos los 5 parámetros que espera tu Controller
    formData.append('idUsuario', idUsuario.toString());
    formData.append('idCarrera', titulo.id_carrera);
    formData.append('fechaGraduacion', titulo.fechaGraduacion);
    formData.append('numeroSenescyt', titulo.registroSenescyt);
    formData.append('archivo', titulo.archivoReferencia); // El archivo binario real

    return this.http.post(`http://localhost:8080/api/perfil-academico/registrar`, formData);
  }

  getIdiomasCatalogo(): Observable<any[]> {
    // Ajusta la URL según tu controlador de Spring Boot (ej: IdiomaController)
    return this.http.get<any[]>(`http://localhost:8080/api/academico/idiomas`);
  }


}
