import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-perfil.html',
  styleUrls: ['./sidebar-perfil.css']
})
export class SidebarPerfilComponent {
  @Input() perfil: any = {};
  @Input() rol: string = 'Postulante';
  @Input() completitudPerfil: number = 0;

  @Input() fotoUrl: string | ArrayBuffer | null = null;

  @Output() fotoSeleccionada = new EventEmitter<Event>();

  triggerFileInput() {
    document.getElementById('fotoInput')?.click();
  }

  onFileChange(event: Event) {
    this.fotoSeleccionada.emit(event);
  }
}
