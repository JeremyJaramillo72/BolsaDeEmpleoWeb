import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

// ✅ Servicio singleton compartido entre TODOS los roles (admin, empresa, postulante).
//
//    FLUJO:
//    1. Al crear el servicio, emite inmediatamente el valor de localStorage (sin delay).
//    2. menuprincipal.ts llama cargarDesdeAPI() → HTTP GET → emite URL a TODOS los suscriptores.
//    3. configuracion-app.ts llama actualizarLogo() tras subir → emite a TODOS sin F5.
//
//    Así, postulantes, empresas y admins ven el mismo logo porque todos
//    están suscritos al mismo BehaviorSubject.

@Injectable({ providedIn: 'root' })
export class SistemaConfigService {

  private readonly API = 'http://localhost:8080/api/configuracion-sistema';

  private readonly logoSubject = new BehaviorSubject<string>(
      localStorage.getItem('logoSistema') ?? ''
  );
  private readonly nombreSubject = new BehaviorSubject<string>(
      localStorage.getItem('nombreSistema') ?? 'Bolsa de Empleo'
  );

  // Observables públicos — menuprincipal.ts se suscribe a estos
  readonly logo$   = this.logoSubject.asObservable();
  readonly nombre$ = this.nombreSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── Carga desde el servidor y emite a todos los suscriptores ──────────
  // Llamar una vez en menuprincipal.ngOnInit().
  // No importa el rol del usuario — todos usan el mismo endpoint público.
  cargarDesdeAPI(): void {
    this.http.get<any>(this.API).subscribe({
      next: cfg => {
        if (cfg?.logoUrl)          this.actualizarLogo(cfg.logoUrl);
        if (cfg?.nombreAplicativo) this.actualizarNombre(cfg.nombreAplicativo);
      },
      error: () => {
        // Si la API falla, queda el valor de localStorage o el default.
        // No rompe la navegación.
      }
    });
  }

  // ── Emite nuevo logo y persiste en localStorage ───────────────────────
  // Llamar desde configuracion-app.ts tras subir logo exitosamente.
  actualizarLogo(url: string): void {
    localStorage.setItem('logoSistema', url);
    this.logoSubject.next(url);
  }

  // ── Emite nuevo nombre y persiste en localStorage ─────────────────────
  actualizarNombre(nombre: string): void {
    localStorage.setItem('nombreSistema', nombre);
    this.nombreSubject.next(nombre);
  }
}
