import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespaldosDbService {
  private apiUrl = 'http://localhost:8080/api/seguridad/backup';
  constructor(private http: HttpClient) {}

  private getUserId(): number {
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id, 10) : 0;
  }

  generarYDescargarBackup(): Observable<Blob> {
    const payload = { idUsuario: this.getUserId() };
    return this.http.post(`${this.apiUrl}/descargar`, payload, { responseType: 'blob' });
  }

  obtenerConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`);
  }

  guardarConfiguracion(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/configuracion`, config);
  }

  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  restaurarEnNuevaBd(idBackup: number, modo: string) {
    const id = this.getUserId();
    return this.http.post(`${this.apiUrl}/restaurar/${idBackup}?modo=${modo}&idUsuario=${id}`, {});
  }
  descargarDeAzure(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/descargar-nube`, {
      params: { fileName: fileName },
      responseType: 'blob'
    });
  }

  listarBackupsEmergencia(): Observable<any[]> {

    return this.http.get<any[]>('http://localhost:8080/api/seguridad/backups-disponibles');
  }

  restaurarEmergencia(nombreArchivo: string): Observable<any> {
    const payload = {
      nombreArchivo: nombreArchivo,
      idUsuario: this.getUserId()
    };
    return this.http.post('http://localhost:8080/api/seguridad/restaurar-emergencia', payload);
  }
}
