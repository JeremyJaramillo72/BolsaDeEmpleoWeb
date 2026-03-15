import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmPeticion {
  titulo:   string;
  mensaje:  string;
  tipo:     'confirmacion' | 'advertencia'; // <-- Agregamos el tipo aquí
  resolver: (valor: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {

  private subject = new Subject<ConfirmPeticion | null>();
  peticion$ = this.subject.asObservable();

  // Recibimos el tipo y lo enviamos en el next()
  abrir(mensaje: string, titulo: string = 'Confirmar', tipo: 'confirmacion' | 'advertencia' = 'confirmacion'): Promise<boolean> {
    return new Promise(resolve => {
      this.subject.next({ titulo, mensaje, tipo, resolver: resolve });
    });
  }
}
