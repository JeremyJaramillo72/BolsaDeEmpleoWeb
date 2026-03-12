import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionCorreoService {

  private apiUrl = '/api/configuracion/correo';

  constructor(private http: HttpClient) { }

  obtenerConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  probarCorreo(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/probar`, { correo });
  }

  actualizarCorreo(correo: string, idUsuario: string | null): Observable<any> {
    return this.http.put(`${this.apiUrl}`, {
      correo,
      idUsuario
    });
  }

  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  actualizarConfiguracionSmtp(config: {
    valor: string;
    password: string;
  }, idUsuario: string | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/smtp`, {
      ...config,
      idUsuario
    });
  }
}
