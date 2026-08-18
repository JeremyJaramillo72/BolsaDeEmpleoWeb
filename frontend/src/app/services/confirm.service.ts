import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmPeticion {
  titulo:     string;
  mensaje:    string;
  tipo:       'confirmacion' | 'advertencia' | 'exito';
  bloqueante: boolean;
  resolver:   (valor: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {

  private subject = new Subject<ConfirmPeticion | null>();
  peticion$ = this.subject.asObservable();

  // 🔥 Actualizamos la firma para permitir 'exito'
  abrir(
    mensaje: string,
    titulo: string = 'Confirmar',
    tipo: 'confirmacion' | 'advertencia' | 'exito' = 'confirmacion',
    bloqueante = false
  ): Promise<boolean> {
    return new Promise(resolve => {
      this.subject.next({ titulo, mensaje, tipo, bloqueante, resolver: resolve });
    });
  }
}
