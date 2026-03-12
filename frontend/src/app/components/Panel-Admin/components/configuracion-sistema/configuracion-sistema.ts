import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionCorreoComponent } from '../configuracion-correo/configuracion-correo';
import { PlantillaNotificacionComponent } from '../plantilla-notificacion/plantilla-notificacion';

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [CommonModule, ConfiguracionCorreoComponent, PlantillaNotificacionComponent],
  template: `
    <div class="config-sistema-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1>⚙️ Configuración del Sistema</h1>
          <p class="subtitle">Gestiona todos los parámetros de configuración de la aplicación</p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-navigation">
        <button
          class="tab-button"
          [class.active]="activeTab === 'correo'"
          (click)="activeTab = 'correo'">
          📧 Configuración de Correo
        </button>
        <button
          class="tab-button"
          [class.active]="activeTab === 'plantillas'"
          (click)="activeTab = 'plantillas'">
          📝 Plantillas de Notificaciones
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tabs-content">
        <!-- Tab: Configuración de Correo -->
        <div *ngIf="activeTab === 'correo'" class="tab-pane active">
          <app-configuracion-correo></app-configuracion-correo>
        </div>

        <!-- Tab: Plantillas -->
        <div *ngIf="activeTab === 'plantillas'" class="tab-pane active">
          <app-plantilla-notificacion></app-plantilla-notificacion>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-sistema-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header-section {
      margin-bottom: 30px;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .tabs-navigation {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      flex-wrap: wrap;
    }

    .tab-button {
      padding: 12px 24px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #4b5563;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .tab-button:hover {
      border-color: #7c3aed;
      color: #7c3aed;
    }

    .tab-button.active {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      border-color: #5b21b6;
    }

    .tabs-content {
      animation: fadeIn 0.3s ease-in;
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Dark mode support */
    :host-context(.dark-mode) .config-sistema-container {
      background: #1a202c;
    }

    :host-context(.dark-mode) .header-section {
      background: #2d3748;
    }

    :host-context(.dark-mode) .header-content h1 {
      color: #f7fafc;
    }

    :host-context(.dark-mode) .header-content .subtitle {
      color: #a0aec0;
    }

    :host-context(.dark-mode) .tabs-navigation {
      background: #2d3748;
    }

    :host-context(.dark-mode) .tab-button {
      background: #1a202c;
      border-color: #4a5568;
      color: #cbd5e0;
    }

    :host-context(.dark-mode) .tab-button:hover {
      border-color: #7c3aed;
      color: #7c3aed;
    }

    @media (max-width: 768px) {
      .config-sistema-container {
        padding: 12px;
      }

      .header-section {
        padding: 20px;
      }

      .header-content h1 {
        font-size: 22px;
      }

      .tabs-navigation {
        flex-direction: column;
      }

      .tab-button {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class ConfiguracionSistemaComponent {
  activeTab: 'correo' | 'plantillas' = 'correo';
}
