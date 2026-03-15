import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SistemaEmpresaDTO {
  idConfig:             number;
  nombreAplicativo:     string;
  descripcion:          string | null;
  logoUrl:              string | null;
  correoSoporte:        string | null;
  telefonoContacto:     string | null;
  direccionInstitucion: string | null;
  fechaCreacion:        string;
  fechaActualizacion:   string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionAppService {

  private readonly API = 'http://localhost:8080/api/configuracion-sistema';

  constructor(private http: HttpClient) {}

  // GET /api/configuracion-sistema
  obtenerConfiguracion(): Observable<SistemaEmpresaDTO> {
    return this.http.get<SistemaEmpresaDTO>(this.API);
  }

  // PUT /api/configuracion-sistema
  actualizarConfiguracion(dto: Partial<SistemaEmpresaDTO>): Observable<SistemaEmpresaDTO> {
    return this.http.put<SistemaEmpresaDTO>(this.API, dto);
  }

  // POST /api/configuracion-sistema/logo  (multipart)
  actualizarLogo(archivo: File): Observable<{ mensaje: string; logoUrl: string; config: SistemaEmpresaDTO }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ mensaje: string; logoUrl: string; config: SistemaEmpresaDTO }>(
      `${this.API}/logo`, formData
    );
  }
}
