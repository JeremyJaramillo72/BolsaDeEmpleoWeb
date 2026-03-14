import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionCorreoComponent } from '../configuracion-correo/configuracion-correo';
import { PlantillaNotificacionComponent } from '../plantilla-notificacion/plantilla-notificacion';
import {RespaldosBd} from './respaldos-bd/respaldos-bd';

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [CommonModule, ConfiguracionCorreoComponent, PlantillaNotificacionComponent, RespaldosBd],
  template: `
    <div class="config-sistema-container">
      <div class="header-section">
        <div class="header-content">
          <h1>⚙️ Configuración del Sistema</h1>
          <p class="subtitle">Gestiona todos los parámetros de configuración de la aplicación</p>
        </div>
      </div>

      <div class="tabs-navigation">
        <button
          class="tab-button"
          [class.active]="activeTab === 'correo'"
          (click)="activeTab = 'correo'">
          <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">email</span>
          Configuración de Correo
        </button>
        <button
          class="tab-button"
          [class.active]="activeTab === 'plantillas'"
          (click)="activeTab = 'plantillas'">
          <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">description</span>
          Plantillas de Notificaciones
        </button>
        <button
          class="tab-button"
          [class.active]="activeTab === 'respaldos'"
          (click)="activeTab = 'respaldos'">
          <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">storage</span>
          Respaldos de Base de Datos
        </button>
      </div>

      <div class="tabs-content">
        <div *ngIf="activeTab === 'correo'" class="tab-pane active">
          <app-configuracion-correo></app-configuracion-correo>
        </div>

        <div *ngIf="activeTab === 'plantillas'" class="tab-pane active">
          <app-plantilla-notificacion></app-plantilla-notificacion>
        </div>

        <div *ngIf="activeTab === 'respaldos'" class="tab-pane active">
          <app-respaldos-bd></app-respaldos-bd>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ... (Mantén exactamente los mismos estilos que ya tenías, no hace falta cambiar nada del CSS de este archivo) ... */
    .config-sistema-container { max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8f9fa; min-height: 100vh; }
    .header-section { margin-bottom: 30px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
    .header-content h1 { font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0; }
    .subtitle { font-size: 14px; color: #718096; margin: 0; }
    .tabs-navigation { display: flex; gap: 12px; margin-bottom: 20px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); flex-wrap: wrap; }
    .tab-button { padding: 12px 24px; border: 2px solid #e2e8f0; background: white; color: #4b5563; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease; white-space: nowrap; }
    .tab-button:hover { border-color: #7c3aed; color: #7c3aed; }
    .tab-button.active { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; border-color: #5b21b6; }
    .tabs-content { animation: fadeIn 0.3s ease-in; }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) {
      .config-sistema-container { padding: 12px; }
      .header-section { padding: 20px; }
      .header-content h1 { font-size: 22px; }
      .tabs-navigation { flex-direction: column; }
      .tab-button { width: 100%; text-align: center; }
    }
  `]
})
export class ConfiguracionSistemaComponent {
  activeTab: 'correo' | 'plantillas' | 'respaldos' = 'correo';
}
