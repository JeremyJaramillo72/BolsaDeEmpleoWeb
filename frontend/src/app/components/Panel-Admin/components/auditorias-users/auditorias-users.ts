import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pilas: Aquí están tus importaciones correctas
import { UsuariosComponent } from './usuarios/usuarios';
import { SesionesComponent } from './sesiones/sesiones';
import { OfertasComponent } from './ofertas/ofertas';
import { PostulantesComponent } from './postulantes/postulantes';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  // OJO: Tienes que meter los componentes hijos aquí para que Angular los reconozca
  imports: [CommonModule, UsuariosComponent, SesionesComponent, OfertasComponent, PostulantesComponent],
  templateUrl: './auditorias-users.html',
  styleUrls: ['./auditorias-users.css']
})
export class AdminUsuariosComponent {

  // ✅ Agregamos 'postulantes' a las opciones posibles
  tabPrincipal: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes' = 'usuarios';

  // Variable para las alertas a nivel general
  mensajeError = '';

  // Nota: Si necesitas cambiar el tab desde el HTML, puedes hacer un método sencillo
  cambiarTabPrincipal(tab: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes'): void {
    this.tabPrincipal = tab;
  }
}
