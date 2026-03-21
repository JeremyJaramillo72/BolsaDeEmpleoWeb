import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from './usuarios/usuarios';
import { SesionesComponent } from './sesiones/sesiones';
import { OfertasComponent } from './ofertas/ofertas';
import { PostulantesComponent } from './postulantes/postulantes';
import { RespaldosComponent } from './respaldos/respaldos';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  // ✅ 2. OJO: Agregamos RespaldosComponent aquí para que Angular lo renderice
  imports: [
    CommonModule,
    UsuariosComponent,
    SesionesComponent,
    OfertasComponent,
    PostulantesComponent,
    RespaldosComponent
  ],
  templateUrl: './auditorias-users.html',
  styleUrls: ['./auditorias-users.css']
})
export class AdminUsuariosComponent {
  tabPrincipal: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes' | 'respaldos' = 'usuarios';
  mensajeError = '';
  cambiarTabPrincipal(tab: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes' | 'respaldos'): void {
    this.tabPrincipal = tab;
  }
}
