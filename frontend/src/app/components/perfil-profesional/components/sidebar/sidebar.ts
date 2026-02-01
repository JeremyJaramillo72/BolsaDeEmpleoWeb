import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule // 👈 2. Agrégalo aquí
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() nombre: string = '';
  @Input() rol: string = '';
  @Input() completitud: number = 0;

  @Output() fotoSubida = new EventEmitter<void>();

  fotoUrl: string | ArrayBuffer | null = null;

  constructor() { }

  subirFoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoUrl = e.target?.result || null;
        this.fotoSubida.emit();
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fotoInput') as HTMLInputElement;
    fileInput.click();
  }
}
