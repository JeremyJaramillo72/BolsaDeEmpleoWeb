import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pilas: Aquí están tus importaciones correctas
import {UsuariosComponent} from './usuarios/usuarios';
import { SesionesComponent } from './sesiones/sesiones';
import { OfertasComponent } from './ofertas/ofertas';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  // OJO: Tienes que meter los componentes hijos aquí para que Angular los reconozca
  imports: [CommonModule, UsuariosComponent, SesionesComponent, OfertasComponent],
  templateUrl: './auditorias-users.html',
  styleUrls: ['./auditorias-users.css']
})
export class AdminUsuariosComponent {

  // Tu variable para controlar qué pestaña se ve por defecto
  tabPrincipal: 'usuarios' | 'sesiones' | 'ofertas' = 'usuarios';

  // Variable para las alertas a nivel general
  mensajeError = '';

  // Nota: Si necesitas cambiar el tab desde el HTML, puedes hacer un método sencillo
  cambiarTabPrincipal(tab: 'usuarios' | 'sesiones' | 'ofertas'): void {
    this.tabPrincipal = tab;
  }
}
