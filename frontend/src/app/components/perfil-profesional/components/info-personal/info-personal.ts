import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilProfesional } from '../../models/perfil.model';

@Component({
  selector: 'app-info-personal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './info-personal.html',
  styleUrls: ['./info-personal.css']
})
export class InfoPersonalComponent {
  // 1. Usamos una inicialización segura para evitar errores en el HTML
  @Input() perfil: any = {};

  // 2. Evento para avisar al padre que el progreso cambió
  @Output() datosCambiados = new EventEmitter<void>();

  constructor() { }

  /**
   * Se ejecuta cada vez que el usuario escribe en un input.
   * Dispara la actualización de la barra de progreso en el componente padre.
   */
  onInputChange(): void {
    console.log('Cambio detectado en Información Personal');
    this.datosCambiados.emit();
  }

  /**
   * Opcional: Podrías agregar una validación específica para la cédula aquí
   */
  /*validarCedula(): void {
    if (this.perfil.cedula && this.perfil.cedula.length > 10) {
      this.perfil.cedula = this.perfil.cedula.substring(0, 10);
    }
    this.onInputChange();
  }*/
}
