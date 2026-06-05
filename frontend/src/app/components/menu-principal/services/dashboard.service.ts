import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

interface DashboardCacheEntry<T> {
  data: T;
  savedAt: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = 'http://localhost:8080/api/dashboard';
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // alineado con backend (5 min)

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.getWithCache('dashboard_admin_v1', `${this.apiUrl}/admin`);
  }

  getEmpresaStats(idEmpresa: number): Observable<any> {
    return this.getWithCache(`dashboard_empresa_${idEmpresa}`, `${this.apiUrl}/empresa/${idEmpresa}`);
  }

  getPostulanteStats(idUsuario: number): Observable<any> {
    return this.getWithCache(`dashboard_postulante_${idUsuario}`, `${this.apiUrl}/postulante/${idUsuario}`);
  }

  /** Devuelve caché al instante; refresca en segundo plano si hay datos guardados. */
  private getWithCache<T>(cacheKey: string, url: string): Observable<T> {
    const cached = this.readCache<T>(cacheKey);
    if (cached) {
      this.http.get<T>(url, { withCredentials: true }).pipe(
        tap(fresh => this.writeCache(cacheKey, fresh))
      ).subscribe({ error: () => { /* mantener caché si falla la red */ } });
      return of(cached);
    }
    return this.http.get<T>(url, { withCredentials: true }).pipe(
      tap(fresh => this.writeCache(cacheKey, fresh))
    );
  }

  private readCache<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as DashboardCacheEntry<T>;
      if (Date.now() - entry.savedAt > this.CACHE_TTL_MS) {
        sessionStorage.removeItem(key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  private writeCache<T>(key: string, data: T): void {
    try {
      const entry: DashboardCacheEntry<T> = { data, savedAt: Date.now() };
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // sessionStorage lleno o deshabilitado — ignorar
    }
  }
}
