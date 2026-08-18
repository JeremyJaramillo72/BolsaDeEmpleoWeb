import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from './usuarios/usuarios';
import { SesionesComponent } from './sesiones/sesiones';
import { OfertasComponent } from './ofertas/ofertas';
import { PostulantesComponent } from './postulantes/postulantes';
import { RespaldosComponent } from './respaldos/respaldos';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    UsuariosComponent,
    SesionesComponent,
    OfertasComponent,
    PostulantesComponent,
    RespaldosComponent
  ],
  templateUrl: './auditorias-users.html',
  styleUrls: ['./auditorias-users.css', './auditorias-responsive.css']
})
export class AdminUsuariosComponent {
  tabPrincipal: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes' | 'respaldos' = 'usuarios';
  mensajeError = '';

  constructor(private cdr: ChangeDetectorRef) {}

  cambiarTabPrincipal(tab: 'usuarios' | 'sesiones' | 'ofertas' | 'postulantes' | 'respaldos'): void {
    this.tabPrincipal = tab;
    this.cdr.detectChanges();
  }
}
