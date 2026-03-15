import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionCorreoComponent } from './configuracion-correo/configuracion-correo';
import { PlantillaNotificacionComponent } from './plantilla-notificacion/plantilla-notificacion';
import { RespaldosBd } from './respaldos-bd/respaldos-bd';
import { ConfiguracionAppComponent } from './configuracion-app';

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [
    CommonModule,
    ConfiguracionCorreoComponent,
    PlantillaNotificacionComponent,
    RespaldosBd,
    ConfiguracionAppComponent
  ],
  templateUrl: './configuracion-sistema.html',
  styleUrls: ['./configuracion-sistema.css']
})
export class ConfiguracionSistemaComponent {
  activeTab: 'aplicacion' | 'correo' | 'plantillas' | 'respaldos' = 'aplicacion';
}
