import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../services/ui-notification.service';

@Component({
  selector: 'app-form-datos-personales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-datos-personales.html',
  styleUrls: ['./form-datos-personales.css']
})
export class FormDatosPersonalesComponent {
  @Input() perfil: any = {};
  @Input() provincias: any[] = [];
  @Input() ciudades: any[] = [];

  @Output() guardar = new EventEmitter<void>();
  @Output() cambioProvincia = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<void>();
  fechaMaxima: string = '';

  constructor(private notif: UiNotificationService) {}
  onProvinciaChange() {
    this.cambioProvincia.emit();
  }
  configurarFechaMaxima() {
    const hoy = new Date();
    // Restamos 18 años exactos
    const hace18Anios = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    this.fechaMaxima = hace18Anios.toISOString().split('T')[0];
  }

  esMayorDeEdad(fecha: string): boolean {
    if (!fecha) return false;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 18;
  }

  onInputChange() {
    this.inputChange.emit();
  }

  guardarDatos() {
    if (!this.esMayorDeEdad(this.perfil.fechaNacimiento)) {
      this.notif.error('Debes ser mayor de 18 años para actualizar tu perfil.');
      return;
    }
    this.guardar.emit();
  }

}
