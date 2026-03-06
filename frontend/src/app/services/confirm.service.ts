import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmPeticion {
  titulo:   string;
  mensaje:  string;
  resolver: (valor: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {

  private subject = new Subject<ConfirmPeticion | null>();
  peticion$ = this.subject.asObservable();

  abrir(mensaje: string, titulo: string = 'Confirmar'): Promise<boolean> {
    return new Promise(resolve => {
      this.subject.next({ titulo, mensaje, resolver: resolve });
    });
  }
}
