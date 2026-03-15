import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ✅ Servicio compartido para que configuracion-app y menuprincipal
//    se comuniquen en tiempo real sin necesitar F5.
//
//    configuracion-app.ts  → llama actualizarLogo() / actualizarNombre()
//    menuprincipal.ts      → suscribe a logo$ / nombre$
//
// BehaviorSubject inicializa con el valor de localStorage
// para que el menú muestre el logo correcto al cargar.

@Injectable({ providedIn: 'root' })
export class SistemaConfigService {

  private readonly logoSubject   = new BehaviorSubject<string>(
    localStorage.getItem('logoSistema') ?? ''
  );
  private readonly nombreSubject = new BehaviorSubject<string>(
    localStorage.getItem('nombreSistema') ?? 'Bolsa de Empleo'
  );

  // Observables públicos — el menú se suscribe a estos
  readonly logo$   = this.logoSubject.asObservable();
  readonly nombre$ = this.nombreSubject.asObservable();

  // Emite nuevo logo y lo persiste en localStorage
  actualizarLogo(url: string): void {
    localStorage.setItem('logoSistema', url);
    this.logoSubject.next(url);
  }

  // Emite nuevo nombre y lo persiste en localStorage
  actualizarNombre(nombre: string): void {
    localStorage.setItem('nombreSistema', nombre);
    this.nombreSubject.next(nombre);
  }
}
