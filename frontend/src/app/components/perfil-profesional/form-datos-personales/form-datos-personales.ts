import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onProvinciaChange() {
    this.cambioProvincia.emit();
  }

  onInputChange() {
    this.inputChange.emit();
  }

  guardarDatos() {
    this.guardar.emit();
  }

}
