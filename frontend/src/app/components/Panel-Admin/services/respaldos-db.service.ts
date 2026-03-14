import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespaldosDbService {
  private apiUrl = 'http://localhost:8080/api/seguridad/backup/descargar';
  constructor(private http: HttpClient) {}

  generarYDescargarBackup(): Observable<Blob> {
    return this.http.post(this.apiUrl, {}, { responseType: 'blob' });
  }
}
